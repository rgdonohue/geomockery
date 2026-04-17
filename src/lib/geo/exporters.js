import { saveAs } from 'file-saver';
import * as shpwrite from '@mapbox/shp-write';

const APP_VERSION = '0.2.0';

/**
 * Build a structured generation config suitable for writing alongside
 * an exported file. This is the "how was this made?" record.
 */
export function buildGenerationConfig({
  features,
  metadata = null,
  settings = null,
  validation = null,
  exportFormat = 'geojson',
  filename = 'generated_features'
} = {}) {
  const featureCount = Array.isArray(features) ? features.length : 0;
  return {
    schemaVersion: 1,
    generatedBy: 'Geomockery',
    appVersion: APP_VERSION,
    synthetic: true,
    syntheticNotice:
      'Features in this export were generated synthetically by Geomockery for demo, testing, or teaching use. Do not treat them as real-world data.',
    timestamp: new Date().toISOString(),
    exportFormat,
    filename,
    featureCount,
    metadata,
    settings,
    validation
  };
}

function featuresAsGeoJSON(features, metadata = null) {
  const featureCollection = {
    type: 'FeatureCollection',
    features: features.map((feature) => ({
      type: 'Feature',
      geometry: feature.geometry,
      properties: feature.properties || {}
    }))
  };

  if (metadata) {
    featureCollection.metadata = metadata;
    featureCollection.generated_by = 'Geomockery';
    featureCollection.synthetic = true;
  }

  return featureCollection;
}

async function featuresAsShapefile(features) {
  try {
    const geojson = featuresAsGeoJSON(features);

    const options = {
      folder: 'generated_features',
      filename: 'generated_features',
      outputType: 'blob',
      compression: 'DEFLATE',
      types: {
        point: 'points',
        polygon: 'polygons',
        polyline: 'lines'
      }
    };

    const zipBlob = shpwrite.zip(geojson, options);
    return zipBlob;
  } catch (error) {
    console.error('Error creating shapefile:', error);
    throw new Error(`Shapefile export failed: ${error.message}`);
  }
}

async function featuresAsGeoPackage() {
  throw new Error('GeoPackage export is temporarily disabled. Please use GeoJSON or Shapefile instead.');
}

function saveConfigSidecar(config, filename) {
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: 'application/json'
  });
  saveAs(blob, `${filename}.config.json`);
}

/**
 * Export features as GeoJSON file.
 *
 * When a `config` object is provided, also emit a sibling
 * `<filename>.config.json` documenting how the dataset was produced.
 */
export function exportAsGeoJSON(features, filename = 'features', metadata = null, config = null) {
  const geojson = featuresAsGeoJSON(features, metadata);
  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: 'application/json'
  });
  saveAs(blob, `${filename}.geojson`);

  if (config) {
    saveConfigSidecar(config, filename);
  }
}

/**
 * Export features as Shapefile (ZIP).
 *
 * A sibling `<filename>.config.json` is saved alongside the zip when a
 * config is provided, because the Shapefile format cannot carry our
 * inline metadata.
 */
export async function exportAsShapefile(features, filename = 'features', config = null) {
  try {
    const zipBlob = await featuresAsShapefile(features);
    saveAs(zipBlob, `${filename}.zip`);

    if (config) {
      saveConfigSidecar(config, filename);
    }
  } catch (error) {
    console.error('Error exporting shapefile:', error);
    throw error;
  }
}

export async function exportAsGeoPackage(features, filename = 'features') {
  try {
    const gpkg = await featuresAsGeoPackage(features);
    const blob = new Blob([gpkg], { type: 'application/geopackage+sqlite3' });
    saveAs(blob, `${filename}.gpkg`);
  } catch (error) {
    console.error('Error exporting geopackage:', error);
    throw error;
  }
}
