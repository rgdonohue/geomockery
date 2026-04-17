import * as turf from '@turf/turf';

/**
 * Lightweight structural validation for generated features.
 *
 * This is intentionally non-blocking: callers (export handlers, the
 * summary panel) surface findings to the user, but nothing here throws
 * or rejects. Geomockery is a fixture workbench — pathological geometry
 * is sometimes the point.
 *
 * Severity levels:
 *   - `error`   : the feature is structurally broken (no coords, NaN, empty geometry).
 *   - `warning` : the feature is well-formed but suspicious (self-intersecting line,
 *                 degenerate polygon, zero-length segment).
 *
 * Returns { issues, summary } where issues is a flat array and summary
 * is a small object suitable for display and for embedding in the
 * generation config sidecar.
 */

const EMPTY_SUMMARY = Object.freeze({
  total: 0,
  errors: 0,
  warnings: 0,
  byKind: {}
});

function pushIssue(issues, issue) {
  issues.push(issue);
}

function validatePointFeature(feature, index, issues) {
  const coords = feature?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) {
    pushIssue(issues, {
      featureIndex: index,
      geometryType: 'Point',
      severity: 'error',
      kind: 'missing_coordinates',
      message: 'Point has no usable coordinates.'
    });
    return;
  }
  const [lon, lat] = coords;
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
    pushIssue(issues, {
      featureIndex: index,
      geometryType: 'Point',
      severity: 'error',
      kind: 'non_finite_coordinate',
      message: 'Point coordinate is not a finite number.'
    });
  }
}

function validateLineFeature(feature, index, issues) {
  const coords = feature?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) {
    pushIssue(issues, {
      featureIndex: index,
      geometryType: 'LineString',
      severity: 'error',
      kind: 'insufficient_vertices',
      message: 'Line has fewer than two vertices.'
    });
    return;
  }

  const hasBadCoord = coords.some(
    (pair) => !Array.isArray(pair) || pair.length < 2 || !Number.isFinite(pair[0]) || !Number.isFinite(pair[1])
  );
  if (hasBadCoord) {
    pushIssue(issues, {
      featureIndex: index,
      geometryType: 'LineString',
      severity: 'error',
      kind: 'non_finite_coordinate',
      message: 'Line contains non-finite coordinate values.'
    });
    return;
  }

  try {
    const length = turf.length(feature, { units: 'meters' });
    if (!Number.isFinite(length) || length < 1e-6) {
      pushIssue(issues, {
        featureIndex: index,
        geometryType: 'LineString',
        severity: 'warning',
        kind: 'zero_length',
        message: 'Line has effectively zero length.'
      });
    }
  } catch (error) {
    pushIssue(issues, {
      featureIndex: index,
      geometryType: 'LineString',
      severity: 'warning',
      kind: 'length_check_failed',
      message: `Could not measure line length: ${error.message}`
    });
  }

  try {
    const kinks = turf.kinks(feature);
    if (kinks?.features?.length > 0) {
      pushIssue(issues, {
        featureIndex: index,
        geometryType: 'LineString',
        severity: 'warning',
        kind: 'self_intersection',
        message: `Line self-intersects at ${kinks.features.length} point${kinks.features.length === 1 ? '' : 's'}.`
      });
    }
  } catch (error) {
    // turf.kinks throws on unsupported geometry shapes; skip silently.
  }
}

function validatePolygonFeature(feature, index, issues) {
  const coords = feature?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length === 0) {
    pushIssue(issues, {
      featureIndex: index,
      geometryType: 'Polygon',
      severity: 'error',
      kind: 'missing_rings',
      message: 'Polygon has no rings.'
    });
    return;
  }

  const outer = coords[0];
  if (!Array.isArray(outer) || outer.length < 4) {
    pushIssue(issues, {
      featureIndex: index,
      geometryType: 'Polygon',
      severity: 'error',
      kind: 'insufficient_vertices',
      message: 'Polygon outer ring has fewer than four vertices.'
    });
    return;
  }

  const hasBadCoord = outer.some(
    (pair) => !Array.isArray(pair) || pair.length < 2 || !Number.isFinite(pair[0]) || !Number.isFinite(pair[1])
  );
  if (hasBadCoord) {
    pushIssue(issues, {
      featureIndex: index,
      geometryType: 'Polygon',
      severity: 'error',
      kind: 'non_finite_coordinate',
      message: 'Polygon contains non-finite coordinate values.'
    });
    return;
  }

  const first = outer[0];
  const last = outer[outer.length - 1];
  if (!first || !last || first[0] !== last[0] || first[1] !== last[1]) {
    pushIssue(issues, {
      featureIndex: index,
      geometryType: 'Polygon',
      severity: 'warning',
      kind: 'unclosed_ring',
      message: 'Polygon outer ring is not closed (first and last vertex differ).'
    });
  }

  try {
    const area = turf.area(feature);
    if (!Number.isFinite(area) || area <= 0) {
      pushIssue(issues, {
        featureIndex: index,
        geometryType: 'Polygon',
        severity: 'warning',
        kind: 'zero_area',
        message: 'Polygon has effectively zero area.'
      });
    }
  } catch (error) {
    pushIssue(issues, {
      featureIndex: index,
      geometryType: 'Polygon',
      severity: 'warning',
      kind: 'area_check_failed',
      message: `Could not measure polygon area: ${error.message}`
    });
  }
}

export function validateFeatures(features) {
  const issues = [];

  if (!Array.isArray(features) || features.length === 0) {
    return { issues, summary: EMPTY_SUMMARY };
  }

  features.forEach((feature, index) => {
    const geometryType = feature?.geometry?.type;
    switch (geometryType) {
      case 'Point':
        validatePointFeature(feature, index, issues);
        break;
      case 'LineString':
        validateLineFeature(feature, index, issues);
        break;
      case 'Polygon':
        validatePolygonFeature(feature, index, issues);
        break;
      case undefined:
      case null:
        issues.push({
          featureIndex: index,
          geometryType: 'unknown',
          severity: 'error',
          kind: 'missing_geometry',
          message: 'Feature has no geometry.'
        });
        break;
      default:
        // MultiLineString / MultiPolygon / etc. are not produced by the
        // current generators; log a note rather than a hard finding.
        issues.push({
          featureIndex: index,
          geometryType,
          severity: 'warning',
          kind: 'unsupported_geometry',
          message: `Geometry type "${geometryType}" is not structurally checked in this release.`
        });
    }
  });

  const summary = {
    total: issues.length,
    errors: issues.filter((i) => i.severity === 'error').length,
    warnings: issues.filter((i) => i.severity === 'warning').length,
    byKind: issues.reduce((acc, issue) => {
      acc[issue.kind] = (acc[issue.kind] || 0) + 1;
      return acc;
    }, {})
  };

  return { issues, summary };
}

/**
 * Turn the structured summary into short human-readable lines for the
 * sidebar summary panel.
 */
export function summarizeIssues(summary) {
  if (!summary || summary.total === 0) {
    return ['No structural issues found.'];
  }

  const lines = [];
  if (summary.errors > 0) {
    lines.push(`${summary.errors} error${summary.errors === 1 ? '' : 's'} (broken geometry).`);
  }
  if (summary.warnings > 0) {
    lines.push(`${summary.warnings} warning${summary.warnings === 1 ? '' : 's'} (suspicious geometry).`);
  }
  const kindLabels = {
    missing_coordinates: 'missing coords',
    non_finite_coordinate: 'non-finite coord',
    insufficient_vertices: 'too few vertices',
    zero_length: 'zero-length line',
    self_intersection: 'self-intersecting line',
    length_check_failed: 'length check failed',
    missing_rings: 'polygon missing rings',
    unclosed_ring: 'unclosed polygon ring',
    zero_area: 'zero-area polygon',
    area_check_failed: 'area check failed',
    missing_geometry: 'no geometry',
    unsupported_geometry: 'unchecked geometry type'
  };
  const kindParts = Object.entries(summary.byKind).map(
    ([kind, count]) => `${count} × ${kindLabels[kind] || kind}`
  );
  if (kindParts.length > 0) {
    lines.push(kindParts.join(', '));
  }
  return lines;
}
