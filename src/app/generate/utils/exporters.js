import { GeoJSON } from 'ol/format';
import { saveAs } from 'file-saver';
import * as shpwrite from '@mapbox/shp-write';

/**
 * Convert features to GeoJSON format
 */
function featuresAsGeoJSON(features) {
  // Create a FeatureCollection directly from the features
  return {
    type: 'FeatureCollection',
    features: features.map(feature => {
      // Ensure the feature has the correct GeoJSON structure
      return {
        type: 'Feature',
        geometry: feature.geometry,
        properties: feature.properties || {}
      };
    })
  };
}

/**
 * Convert features to Shapefile format
 */
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
    
    // Use the mapbox shp-write library
    const zipBlob = shpwrite.zip(geojson, options);
    return zipBlob;
  } catch (error) {
    console.error('Error creating shapefile:', error);
    throw new Error(`Shapefile export failed: ${error.message}`);
  }
}

/**
 * Convert features to GeoPackage format
 * Note: Temporarily disabled due to browser compatibility issues
 */
async function featuresAsGeoPackage(features) {
  // Temporarily disabled - GeoPackage library has browser compatibility issues
  throw new Error('GeoPackage export is temporarily disabled. Please use GeoJSON or Shapefile instead.');
}

/**
 * Export features as GeoJSON file
 */
export function exportAsGeoJSON(features, filename = 'features') {
  const geojson = featuresAsGeoJSON(features);
  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: 'application/json'
  });
  saveAs(blob, `${filename}.geojson`);
}

/**
 * Export features as Shapefile (ZIP)
 */
export async function exportAsShapefile(features, filename = 'features') {
  try {
    const zipBlob = await featuresAsShapefile(features);
    saveAs(zipBlob, `${filename}.zip`);
  } catch (error) {
    console.error('Error exporting shapefile:', error);
    throw error;
  }
}

/**
 * Export features as GeoPackage
 */
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