import * as turf from '@turf/turf';
import { getRandomFloat, getRandomInt, getRandomArrayItem, getRandomId } from '@/lib/utils/random';
import { DEFAULT_UTILITY_NETWORK_SETTINGS, getUtilityDensityPreset } from '@/lib/geo/utilityNetworkConfig';

/**
 * Generate a random point within bounds and optionally within a constraining polygon
 */
export function generatePoint(bounds, attributes = [], constrainingPolygon = null) {
  let point;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    const lon = getRandomFloat(bounds[0], bounds[2]);
    const lat = getRandomFloat(bounds[1], bounds[3]);
    point = turf.point([lon, lat]);
    attempts++;

    if (!constrainingPolygon) {
      break;
    }

    try {
      if (!constrainingPolygon.geometry || !constrainingPolygon.geometry.coordinates) {
        console.warn('Constraining polygon missing geometry or coordinates, skipping constraint');
        break;
      }

      if (turf.booleanPointInPolygon(point, constrainingPolygon)) {
        break;
      }
    } catch (error) {
      console.warn('Error checking point in polygon:', error, 'Polygon:', constrainingPolygon);
      break;
    }

    if (attempts >= maxAttempts) {
      console.warn('Could not generate point within constraining polygon after', maxAttempts, 'attempts');
      return null;
    }
  } while (true);

  point.properties = generateProperties(attributes);
  return point;
}

/**
 * Returns true only when a generated line or polygon stays strictly inside
 * the constraining polygon without crossing or touching its boundary.
 */
function isStrictlyContainedInPolygon(feature, constrainingPolygon) {
  if (!constrainingPolygon) {
    return true;
  }

  if (!constrainingPolygon.geometry || !constrainingPolygon.geometry.coordinates) {
    console.warn('Constraining polygon missing geometry or coordinates, rejecting constrained feature');
    return false;
  }

  try {
    if (!turf.booleanWithin(feature, constrainingPolygon)) {
      return false;
    }

    const constrainingBoundary = turf.polygonToLine(constrainingPolygon);
    const featureBoundary =
      feature.geometry.type === 'LineString'
        ? feature
        : turf.polygonToLine(feature);

    return turf.lineIntersect(featureBoundary, constrainingBoundary).features.length === 0;
  } catch (error) {
    console.warn('Error checking feature containment in polygon:', error, 'Feature:', feature, 'Polygon:', constrainingPolygon);
    return false;
  }
}

function generateProperties(attributes) {
  const properties = {};

  for (const attr of attributes) {
    switch (attr.type) {
      case 'nominal':
        properties[attr.name] = getRandomArrayItem(attr.values);
        break;
      case 'ordinal':
        properties[attr.name] = getRandomArrayItem(attr.values);
        break;
      case 'quantitative':
        properties[attr.name] = getRandomFloat(attr.range.min, attr.range.max);
        if (attr.range.unit) {
          properties[`${attr.name}_unit`] = attr.range.unit;
        }
        break;
      case 'temporal': {
        const startDate = new Date(attr.range.start);
        const endDate = new Date(attr.range.end);
        const randomDate = new Date(
          startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
        );
        properties[attr.name] = randomDate.toISOString();
        break;
      }
      case 'identifier':
        properties[attr.name] = getRandomId(
          attr.format.digits || 6,
          attr.format.prefix || ''
        );
        break;
    }
  }

  return properties;
}

function withGeneratedProperties(attributes, baseProperties = {}) {
  return {
    ...generateProperties(attributes),
    ...baseProperties
  };
}

function isPointAllowed(point, constrainingPolygon = null, exclusionPolygons = []) {
  if (constrainingPolygon && !turf.booleanPointInPolygon(point, constrainingPolygon)) {
    return false;
  }

  for (const exclusion of exclusionPolygons) {
    try {
      if (turf.booleanPointInPolygon(point, exclusion)) {
        return false;
      }
    } catch (error) {
      console.warn('Error checking point exclusion:', error);
      return false;
    }
  }

  return true;
}

function lineViolatesExclusions(line, exclusionPolygons = []) {
  for (const exclusion of exclusionPolygons) {
    try {
      const exclusionBoundary = turf.polygonToLine(exclusion);
      if (turf.lineIntersect(line, exclusionBoundary).features.length > 0) {
        return true;
      }

      const startPoint = turf.point(line.geometry.coordinates[0]);
      const endPoint = turf.point(line.geometry.coordinates[line.geometry.coordinates.length - 1]);
      const midpoint = turf.along(line, turf.length(line) / 2);

      if (
        turf.booleanPointInPolygon(startPoint, exclusion) ||
        turf.booleanPointInPolygon(endPoint, exclusion) ||
        turf.booleanPointInPolygon(midpoint, exclusion)
      ) {
        return true;
      }
    } catch (error) {
      console.warn('Error checking exclusion overlap:', error);
      return true;
    }
  }

  return false;
}

function getLineEndpoints(line) {
  const coordinates = line.geometry.coordinates;
  return [coordinates[0], coordinates[coordinates.length - 1]];
}

function coordinatesNear(coordA, coordB, toleranceMeters = 2) {
  return turf.distance(turf.point(coordA), turf.point(coordB), { units: 'kilometers' }) * 1000 <= toleranceMeters;
}

function isSharedEndpoint(intersectionCoordinate, candidate, existing) {
  const candidateEndpoints = getLineEndpoints(candidate);
  const existingEndpoints = getLineEndpoints(existing);

  return (
    candidateEndpoints.some((endpoint) => coordinatesNear(endpoint, intersectionCoordinate)) &&
    existingEndpoints.some((endpoint) => coordinatesNear(endpoint, intersectionCoordinate))
  );
}

function approximateLineDistanceMeters(lineA, lineB) {
  const pointsA = [
    ...getLineEndpoints(lineA),
    turf.along(lineA, turf.length(lineA) / 2).geometry.coordinates
  ];
  const pointsB = [
    ...getLineEndpoints(lineB),
    turf.along(lineB, turf.length(lineB) / 2).geometry.coordinates
  ];

  return Math.min(
    ...pointsA.map((coord) => turf.pointToLineDistance(turf.point(coord), lineB, { units: 'meters' })),
    ...pointsB.map((coord) => turf.pointToLineDistance(turf.point(coord), lineA, { units: 'meters' }))
  );
}

function lineViolatesNetwork(candidate, existingLines = [], minSeparation = 0) {
  for (const existing of existingLines) {
    const intersections = turf.lineIntersect(candidate, existing).features;
    if (
      intersections.some(
        (intersection) => !isSharedEndpoint(intersection.geometry.coordinates, candidate, existing)
      )
    ) {
      return true;
    }

    if (minSeparation > 0 && !getLineEndpoints(candidate).some((endpoint) => getLineEndpoints(existing).some((other) => coordinatesNear(endpoint, other, 4)))) {
      if (approximateLineDistanceMeters(candidate, existing) < minSeparation) {
        return true;
      }
    }
  }

  return false;
}

function isValidUtilitySegment(line, options, existingLines = []) {
  const { constrainingPolygon, exclusionPolygons = [], minSeparation = 0 } = options;

  if (!isStrictlyContainedInPolygon(line, constrainingPolygon)) {
    return false;
  }

  if (lineViolatesExclusions(line, exclusionPolygons)) {
    return false;
  }

  if (lineViolatesNetwork(line, existingLines, minSeparation)) {
    return false;
  }

  return true;
}

function generateValidPoint(bounds, constrainingPolygon, exclusionPolygons = [], scorer = null, attempts = 120) {
  let bestPoint = null;
  let bestScore = -Infinity;

  for (let index = 0; index < attempts; index++) {
    const candidate = generatePoint(bounds, [], constrainingPolygon);
    if (!candidate || !isPointAllowed(candidate, constrainingPolygon, exclusionPolygons)) {
      continue;
    }

    if (!scorer) {
      return candidate;
    }

    const score = scorer(candidate, index);
    if (score > bestScore) {
      bestScore = score;
      bestPoint = candidate;
    }
  }

  return bestPoint;
}

function getOrientationVector(bounds, corridorBias) {
  const width = Math.abs(bounds[2] - bounds[0]);
  const height = Math.abs(bounds[3] - bounds[1]);

  if (corridorBias === 'long-axis') {
    return width >= height ? [1, 0] : [0, 1];
  }

  if (corridorBias === 'cluster-to-cluster') {
    return width >= height ? [0.8, 0.4] : [0.4, 0.8];
  }

  const angle = getRandomFloat(0, Math.PI);
  return [Math.cos(angle), Math.sin(angle)];
}

function projectCoordinate(coord, vector) {
  return coord[0] * vector[0] + coord[1] * vector[1];
}

function generateBackboneNodes(bounds, options) {
  const {
    constrainingPolygon,
    exclusionPolygons = [],
    anchorStrategy = 'edge-to-center',
    corridorBias = 'long-axis',
    density = 'medium'
  } = options;

  const densityPreset = getUtilityDensityPreset(density);
  const orientation = getOrientationVector(bounds, corridorBias);
  const perpendicular = [-orientation[1], orientation[0]];
  const nodeCount = getRandomInt(
    densityPreset.backboneSegments[0] + 1,
    densityPreset.backboneSegments[1] + 1
  );

  const start = generateValidPoint(
    bounds,
    constrainingPolygon,
    exclusionPolygons,
    (point) => -projectCoordinate(point.geometry.coordinates, orientation),
    180
  );
  const end = generateValidPoint(
    bounds,
    constrainingPolygon,
    exclusionPolygons,
    (point) => projectCoordinate(point.geometry.coordinates, orientation),
    180
  );

  if (!start || !end) {
    return null;
  }

  const width = Math.abs(bounds[2] - bounds[0]);
  const height = Math.abs(bounds[3] - bounds[1]);
  const jitterMagnitude = Math.max(width, height) * densityPreset.backboneJitterRatio;

  const coordinates = [start.geometry.coordinates];

  for (let index = 1; index < nodeCount - 1; index++) {
    const t = index / (nodeCount - 1);
    const base = [
      start.geometry.coordinates[0] + (end.geometry.coordinates[0] - start.geometry.coordinates[0]) * t,
      start.geometry.coordinates[1] + (end.geometry.coordinates[1] - start.geometry.coordinates[1]) * t
    ];

    let candidatePoint = null;

    for (let attempt = 0; attempt < 40; attempt++) {
      const clusterBias = anchorStrategy === 'anchor-clusters' ? (attempt % 2 === 0 ? 1.25 : -1.25) : 1;
      const centerBias = anchorStrategy === 'edge-to-center' ? 1 - Math.abs(0.5 - t) : 1;
      const offset = getRandomFloat(-jitterMagnitude, jitterMagnitude) * clusterBias * centerBias;
      const coord = [
        base[0] + perpendicular[0] * offset,
        base[1] + perpendicular[1] * offset
      ];
      const point = turf.point(coord);
      if (isPointAllowed(point, constrainingPolygon, exclusionPolygons)) {
        candidatePoint = point;
        break;
      }
    }

    if (!candidatePoint) {
      candidatePoint = generateValidPoint(
        bounds,
        constrainingPolygon,
        exclusionPolygons,
        (point) => {
          const coord = point.geometry.coordinates;
          const delta = Math.abs(coord[0] - base[0]) + Math.abs(coord[1] - base[1]);
          const orientationPenalty = Math.abs(projectCoordinate(coord, orientation) - projectCoordinate(base, orientation));
          return -(delta + orientationPenalty);
        },
        anchorStrategy === 'random-anchors' ? 120 : 220
      );
    }

    if (!candidatePoint) {
      return null;
    }

    coordinates.push(candidatePoint.geometry.coordinates);
  }

  coordinates.push(end.geometry.coordinates);
  return { coordinates, orientation };
}

function createUtilitySegment(startCoord, endCoord, attributes, baseProperties) {
  const line = turf.lineString([startCoord, endCoord]);
  line.properties = withGeneratedProperties(attributes, {
    ...baseProperties,
    length_m: Math.round(turf.length(line, { units: 'kilometers' }) * 1000)
  });
  return line;
}

function getBackboneBearing(backboneNodes, nodeIndex) {
  if (backboneNodes.length < 2) {
    return getRandomFloat(0, 360);
  }

  if (nodeIndex >= backboneNodes.length - 1) {
    return turf.bearing(turf.point(backboneNodes[nodeIndex - 1]), turf.point(backboneNodes[nodeIndex]));
  }

  return turf.bearing(turf.point(backboneNodes[nodeIndex]), turf.point(backboneNodes[nodeIndex + 1]));
}

function getBranchAngle(baseBearing, pattern) {
  const side = getRandomInt(0, 1) === 0 ? -1 : 1;
  const offsetRange =
    pattern === 'backbone' ? [55, 90] :
    pattern === 'looped' ? [40, 110] :
    pattern === 'mixed' ? [50, 100] :
    [70, 115];
  return baseBearing + side * getRandomFloat(offsetRange[0], offsetRange[1]);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getUtilityBranchTarget(quantity, pattern, density) {
  const densityPreset = getUtilityDensityPreset(density);
  const baseTarget = Math.max(2, Math.round(quantity * densityPreset.branchTargetMultiplier));

  switch (pattern) {
    case 'backbone':
      return clamp(Math.round(baseTarget * 0.6), 2, Math.max(2, quantity));
    case 'looped':
      return clamp(Math.round(baseTarget * 0.85), 2, Math.max(3, quantity));
    case 'mixed':
      return clamp(Math.round(baseTarget), 3, Math.max(4, quantity));
    case 'branching':
    default:
      return clamp(Math.round(baseTarget * 1.15), 3, Math.max(4, quantity));
  }
}

function getUtilityLoopTarget(quantity, pattern) {
  if (pattern === 'looped') {
    return clamp(Math.round(quantity * 0.2), 1, 4);
  }

  if (pattern === 'mixed') {
    return clamp(Math.round(quantity * 0.1), 1, 2);
  }

  return 0;
}

export function generateUtilityNetwork(bounds, attributes = [], options = {}) {
  const settings = {
    ...DEFAULT_UTILITY_NETWORK_SETTINGS,
    ...options
  };

  const {
    constrainingPolygon = null,
    exclusionPolygons = [],
    quantity = 18,
    networkType,
    pattern,
    density,
    anchorStrategy,
    corridorBias,
    minSeparation
  } = settings;

  const warnings = [];
  const densityPreset = getUtilityDensityPreset(density);
  const maxNetworkAttempts = 14;

  const boundsDiagonalMeters = turf.distance(
    turf.point([bounds[0], bounds[1]]),
    turf.point([bounds[2], bounds[3]]),
    { units: 'meters' }
  );
  const branchScale = Math.max(
    1,
    (boundsDiagonalMeters * 0.04) / densityPreset.branchLengthRange[1]
  );
  const scaledBranchRange = [
    densityPreset.branchLengthRange[0] * branchScale,
    densityPreset.branchLengthRange[1] * branchScale
  ];

  for (let attempt = 0; attempt < maxNetworkAttempts; attempt++) {
    const backbone = generateBackboneNodes(bounds, {
      constrainingPolygon,
      exclusionPolygons,
      anchorStrategy,
      corridorBias,
      density
    });

    if (!backbone) {
      continue;
    }

    const features = [];
    const networkNodes = [...backbone.coordinates];

    let validBackbone = true;

    for (let index = 0; index < backbone.coordinates.length - 1; index++) {
      const segment = createUtilitySegment(
        backbone.coordinates[index],
        backbone.coordinates[index + 1],
        attributes,
        {
          network_type: networkType,
          network_pattern: pattern,
          workflow_mode: 'utility',
          segment_role: 'backbone',
          segment_index: index + 1
        }
      );

      if (!isValidUtilitySegment(segment, { constrainingPolygon, exclusionPolygons, minSeparation }, features)) {
        validBackbone = false;
        break;
      }

      features.push(segment);
    }

    if (!validBackbone || features.length < 2) {
      continue;
    }

    const branchTarget = getUtilityBranchTarget(quantity, pattern, density);
    let branchAttempts = 0;

    while (features.length < branchTarget && branchAttempts < branchTarget * 24) {
      branchAttempts++;

      const originIndex = getRandomInt(0, networkNodes.length - 2);
      const originCoord = networkNodes[originIndex];
      const baseBearing = getBackboneBearing(backbone.coordinates, Math.min(originIndex, backbone.coordinates.length - 2));
      const angle = getBranchAngle(baseBearing, pattern);
      const branchLength = getRandomFloat(
        scaledBranchRange[0],
        scaledBranchRange[1]
      );
      const endPoint = turf.destination(turf.point(originCoord), branchLength / 1000, angle, { units: 'kilometers' });

      if (!isPointAllowed(endPoint, constrainingPolygon, exclusionPolygons)) {
        continue;
      }

      const segment = createUtilitySegment(
        originCoord,
        endPoint.geometry.coordinates,
        attributes,
        {
          network_type: networkType,
          network_pattern: pattern,
          workflow_mode: 'utility',
          segment_role: 'branch',
          segment_index: features.length + 1
        }
      );

      if (!isValidUtilitySegment(segment, { constrainingPolygon, exclusionPolygons, minSeparation }, features)) {
        continue;
      }

      features.push(segment);
      networkNodes.push(endPoint.geometry.coordinates);
    }

    const loopTarget = getUtilityLoopTarget(quantity, pattern);
    let loopsAdded = 0;
    let loopAttempts = 0;

    while (loopsAdded < loopTarget && loopAttempts < loopTarget * 24) {
      loopAttempts++;

      const startIndex = getRandomInt(0, networkNodes.length - 1);
      let endIndex = getRandomInt(0, networkNodes.length - 1);

      if (startIndex === endIndex) {
        continue;
      }

      if (Math.abs(startIndex - endIndex) <= 1) {
        endIndex = (endIndex + 2) % networkNodes.length;
      }

      const startCoord = networkNodes[startIndex];
      const endCoord = networkNodes[endIndex];

      if (coordinatesNear(startCoord, endCoord, minSeparation)) {
        continue;
      }

      const segment = createUtilitySegment(
        startCoord,
        endCoord,
        attributes,
        {
          network_type: networkType,
          network_pattern: pattern,
          workflow_mode: 'utility',
          segment_role: 'loop',
          segment_index: features.length + 1
        }
      );

      if (!isValidUtilitySegment(segment, { constrainingPolygon, exclusionPolygons, minSeparation }, features)) {
        continue;
      }

      features.push(segment);
      loopsAdded++;
    }

    const targetSegments = Math.max(3, quantity);

    if (features.length < Math.max(2, Math.round(targetSegments * 0.45))) {
      continue;
    }

    if (features.length < targetSegments) {
      warnings.push(
        `Generated ${features.length} segments instead of the requested ${targetSegments}. Try reducing separation or using a larger boundary.`
      );
    }

    const totalLengthMeters = Math.round(
      features.reduce((sum, feature) => sum + turf.length(feature, { units: 'kilometers' }) * 1000, 0)
    );

    return {
      features,
      metadata: {
        geometryType: 'line',
        workflowMode: 'utility',
        networkType,
        networkPattern: pattern,
        density,
        anchorStrategy,
        corridorBias,
        minSeparation,
        targetSegments,
        generatedSegments: features.length,
        exclusionsUsed: exclusionPolygons.length,
        totalLengthMeters,
        syntheticNotice: 'Synthetic network geometry generated from explicit rules, not real infrastructure.',
        constraints: {
          extent: constrainingPolygon ? 'custom boundary' : 'map viewport',
          obstacleBehavior: settings.obstacleBehavior,
          exclusionFeatures: exclusionPolygons.length
        },
        anchorPoints: backbone.coordinates.map((coordinates, index) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates },
          properties: {
            anchor_role: index === 0 ? 'origin' : index === backbone.coordinates.length - 1 ? 'terminal' : 'junction'
          }
        }))
      },
      warnings
    };
  }

  warnings.push('Could not generate a connected network within the current boundary and exclusion zones.');

  return {
    features: [],
    metadata: {
      geometryType: 'line',
      workflowMode: 'utility',
      networkType,
      networkPattern: pattern,
      density,
      anchorStrategy,
      corridorBias,
      minSeparation,
      targetSegments: Math.max(3, quantity),
      generatedSegments: 0,
      exclusionsUsed: exclusionPolygons.length,
      totalLengthMeters: 0,
      syntheticNotice: 'Synthetic network geometry generated from explicit rules, not real infrastructure.',
      constraints: {
        extent: constrainingPolygon ? 'custom boundary' : 'map viewport',
        obstacleBehavior: settings.obstacleBehavior,
        exclusionFeatures: exclusionPolygons.length
      },
      anchorPoints: []
    },
    warnings
  };
}

/**
 * Generate a random line within bounds and with specified length constraints
 */
export function generateLine(bounds, attributes = [], options = {}) {
  const {
    minLength = 100,
    maxLength = 1000,
    constrainingPolygon = null
  } = options;

  let line;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    const startPoint = generatePoint(bounds, [], constrainingPolygon);
    if (!startPoint) return null;

    const angle = getRandomFloat(0, 360);
    const length = getRandomFloat(minLength, maxLength);
    const endPoint = turf.destination(startPoint, length / 1000, angle);

    line = turf.lineString([
      startPoint.geometry.coordinates,
      endPoint.geometry.coordinates
    ]);

    attempts++;

    if (isStrictlyContainedInPolygon(line, constrainingPolygon)) {
      const lineLength = turf.length(line) * 1000;
      if (lineLength >= minLength && lineLength <= maxLength) {
        break;
      }
    }

    if (attempts >= maxAttempts) {
      console.warn('Could not generate line with specified constraints after', maxAttempts, 'attempts');
      return null;
    }
  } while (true);

  line.properties = withGeneratedProperties(attributes, {
    length: turf.length(line) * 1000
  });

  return line;
}

/**
 * Generate a random polygon within bounds and with specified area constraints
 */
export function generatePolygon(bounds, attributes = [], options = {}) {
  const {
    minArea = 1000,
    maxArea = 10000,
    constrainingPolygon = null
  } = options;

  let polygon;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    const center = generatePoint(bounds, [], constrainingPolygon);
    if (!center) return null;

    const targetArea = getRandomFloat(minArea, maxArea);
    const radius = Math.sqrt(targetArea / Math.PI);
    const vertices = [];
    const numVertices = getRandomInt(6, 12);

    for (let index = 0; index < numVertices; index++) {
      const angle = (index * 360 / numVertices) + getRandomFloat(-10, 10);
      const distance = radius * (1 + getRandomFloat(-0.2, 0.2)) / 1000;
      const vertex = turf.destination(center, distance, angle);
      vertices.push(vertex.geometry.coordinates);
    }

    vertices.push(vertices[0]);
    polygon = turf.polygon([vertices]);
    attempts++;

    const area = turf.area(polygon);
    if (area >= minArea && area <= maxArea && isStrictlyContainedInPolygon(polygon, constrainingPolygon)) {
      break;
    }

    if (attempts >= maxAttempts) {
      console.warn('Could not generate polygon with specified constraints after', maxAttempts, 'attempts');
      return null;
    }
  } while (true);

  polygon.properties = withGeneratedProperties(attributes, {
    area: turf.area(polygon)
  });

  return polygon;
}

/**
 * Generates a batch of random features
 */
export function generateFeatures(geometryType, count, options = {}, customAttributes = []) {
  const {
    boundingBox,
    minLength = 100,
    maxLength = 1000,
    minArea = 1000,
    maxArea = 10000,
    constrainingPolygon,
    lineWorkflowMode = 'basic'
  } = options;

  const bbox = boundingBox || [-180, -90, 180, 90];

  if (geometryType === 'line' && lineWorkflowMode === 'utility') {
    return generateUtilityNetwork(bbox, customAttributes, {
      ...options,
      quantity: count
    }).features;
  }

  const features = [];

  for (let index = 0; index < count; index++) {
    let feature;

    if (geometryType === 'point') {
      feature = generatePoint(bbox, customAttributes, constrainingPolygon);
    } else if (geometryType === 'line') {
      feature = generateLine(bbox, customAttributes, {
        minLength,
        maxLength,
        constrainingPolygon
      });
    } else if (geometryType === 'polygon') {
      feature = generatePolygon(bbox, customAttributes, {
        minArea,
        maxArea,
        constrainingPolygon
      });
    }

    if (feature) {
      features.push(feature);
    }
  }

  return features;
}
