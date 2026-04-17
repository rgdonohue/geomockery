export const LINE_WORKFLOW_MODES = {
  BASIC: 'basic',
  UTILITY: 'utility'
};

export const UTILITY_NETWORK_TYPES = [
  { value: 'generic', label: 'Generic utility' },
  { value: 'water', label: 'Water' },
  { value: 'sewer', label: 'Sewer' },
  { value: 'electric', label: 'Electric' },
  { value: 'telecom', label: 'Telecom' }
];

export const UTILITY_PATTERNS = [
  { value: 'branching', label: 'Branching tree' },
  { value: 'backbone', label: 'Spine' },
  { value: 'looped', label: 'Spine with loops' },
  { value: 'mixed', label: 'Mix' }
];

export const UTILITY_DENSITIES = [
  { value: 'sparse', label: 'Sparse' },
  { value: 'medium', label: 'Medium' },
  { value: 'dense', label: 'Dense' }
];

export const UTILITY_ANCHOR_STRATEGIES = [
  { value: 'edge-to-center', label: 'Edge to center' },
  { value: 'random-anchors', label: 'Random anchors' },
  { value: 'anchor-clusters', label: 'Anchor clusters' }
];

export const UTILITY_CORRIDOR_BIASES = [
  { value: 'long-axis', label: 'Long axis' },
  { value: 'cluster-to-cluster', label: 'Cluster to cluster' },
  { value: 'none', label: 'No corridor bias' }
];

export const DEFAULT_UTILITY_NETWORK_SETTINGS = {
  networkType: 'generic',
  pattern: 'branching',
  density: 'medium',
  anchorStrategy: 'edge-to-center',
  corridorBias: 'long-axis',
  minSeparation: 90,
  obstacleBehavior: 'avoid-exclusions'
};

export const UTILITY_PATTERN_DESCRIPTIONS = {
  branching: 'A main trunk with side branches spreading outward.',
  backbone: 'Mostly one long main line, few branches.',
  looped: 'Main line with a few connecting loops.',
  mixed: 'Mix of trunk, branches, and a few loops.'
};

export function getUtilityDensityPreset(density) {
  switch (density) {
    case 'sparse':
      return {
        branchLengthRange: [140, 320],
        backboneJitterRatio: 0.08,
        backboneSegments: [2, 3],
        branchTargetMultiplier: 0.25
      };
    case 'dense':
      return {
        branchLengthRange: [220, 520],
        backboneJitterRatio: 0.18,
        backboneSegments: [4, 6],
        branchTargetMultiplier: 0.75
      };
    case 'medium':
    default:
      return {
        branchLengthRange: [180, 420],
        backboneJitterRatio: 0.12,
        backboneSegments: [3, 4],
        branchTargetMultiplier: 0.45
      };
  }
}
