export const MAP_CONFIG = {
  DEFAULT_CENTER: [-74.5, 40],
  DEFAULT_ZOOM: 9,
  MAX_ZOOM: 18,
  MIN_ZOOM: 1,
  TILE_URL: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '© OpenStreetMap contributors'
};

export const DRAWING_STYLES = {
  FILL_COLOR: 'rgba(255, 255, 255, 0.2)',
  STROKE_COLOR: '#ffcc33',
  STROKE_WIDTH: 2
};

export const FEATURE_STYLES = {
  POINT: {
    RADIUS: 6,
    FILL_COLOR: 'rgba(255, 0, 0, 0.8)',
    STROKE_COLOR: '#ffffff',
    STROKE_WIDTH: 2
  },
  LINE: {
    STROKE_COLOR: 'rgba(0, 0, 255, 0.8)',
    STROKE_WIDTH: 3
  },
  POLYGON: {
    FILL_COLOR: 'rgba(0, 255, 0, 0.3)',
    STROKE_COLOR: 'rgba(0, 255, 0, 0.8)',
    STROKE_WIDTH: 2
  }
}; 