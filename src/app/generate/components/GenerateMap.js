'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Draw, Modify, Snap } from 'ol/interaction';
import { GeoJSON } from 'ol/format';
import * as olControl from 'ol/control';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
import * as turf from '@turf/turf';
import { generatePoint, generateLine, generatePolygon } from '../utils/generators';

/**
 * Map component for generating and visualizing geospatial features
 */
const GenerateMap = forwardRef(({ generationArea, onDrawingComplete, uploadedGeoJSON }, ref) => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [drawInteraction, setDrawInteraction] = useState(null);
  const [drawnFeatures, setDrawnFeatures] = useState(null);
  const [featuresSource] = useState(new VectorSource());
  const [drawSource] = useState(new VectorSource());

  // Initialize map
  useEffect(() => {
    if (map) return;

    // Base layers
    const osm = new TileLayer({
      source: new OSM(),
      visible: true
    });

    // Vector layer for generated features
    const featuresLayer = new VectorLayer({
      source: featuresSource,
      style: function(feature) {
        const geomType = feature.getGeometry().getType();
        
        if (geomType === 'Point') {
          return new Style({
            image: new CircleStyle({
              radius: 6,
              fill: new Fill({
                color: '#4338ca'
              }),
              stroke: new Stroke({
                color: '#312e81',
                width: 2
              })
            })
          });
        } else if (geomType === 'LineString') {
          return new Style({
            stroke: new Stroke({
              color: '#4338ca',
              width: 2
            })
          });
        } else {
          return new Style({
            fill: new Fill({
              color: 'rgba(67, 56, 202, 0.3)'
            }),
            stroke: new Stroke({
              color: '#312e81',
              width: 2
            })
          });
        }
      }
    });

    // Vector layer for drawing
    const drawLayer = new VectorLayer({
      source: drawSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(67, 56, 202, 0.2)'
        }),
        stroke: new Stroke({
          color: '#4338ca',
          width: 2
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#4338ca'
          })
        })
      })
    });

    const newMap = new Map({
      target: mapContainer.current,
      layers: [osm, featuresLayer, drawLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2
      }),
      controls: olControl.defaults({
        zoom: true,
        rotate: false,
        attribution: false
      })
    });

    setMap(newMap);

    return () => {
      if (newMap) {
        newMap.setTarget(undefined);
      }
    };
  }, [featuresSource, drawSource]);

  // Handle generation area changes
  useEffect(() => {
    if (!map) return;

    // Clean up any existing draw interaction
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
      setDrawInteraction(null);
    }

    if (generationArea === 'draw') {
      // Set up drawing interaction
      const draw = new Draw({
        source: drawSource,
        type: 'Polygon'
      });

      draw.on('drawstart', () => {
        // Clear previous drawing only when starting a new one
        drawSource.clear();
        setDrawnFeatures(null);
      });

      draw.on('drawend', (evt) => {
        const format = new GeoJSON();
        const feature = evt.feature;
        const geoJSON = format.writeFeatureObject(feature, {
          featureProjection: 'EPSG:3857',
          dataProjection: 'EPSG:4326'
        });

        setDrawnFeatures(geoJSON);
        onDrawingComplete(geoJSON);
      });

      map.addInteraction(draw);
      setDrawInteraction(draw);
    } else if (generationArea === 'viewport') {
      // Clear drawn area when switching to viewport mode
      drawSource.clear();
      setDrawnFeatures(null);
      onDrawingComplete(null);
    }
  }, [map, generationArea, drawSource, onDrawingComplete]);

  // Handle uploaded GeoJSON changes
  useEffect(() => {
    if (!map || !uploadedGeoJSON) return;

    try {
      // Clear existing uploaded features
      drawSource.clear();
      setDrawnFeatures(null);

      // Convert to OpenLayers features
      const format = new GeoJSON();
      const features = format.readFeatures(uploadedGeoJSON, {
        featureProjection: 'EPSG:3857'
      });

      // Add to the draw source
      drawSource.addFeatures(features);

      // Zoom to the extent
      map.getView().fit(drawSource.getExtent(), {
        padding: [50, 50, 50, 50],
        maxZoom: 16
      });

      setDrawnFeatures(uploadedGeoJSON);
    } catch (error) {
      console.error('Error processing uploaded GeoJSON:', error);
    }
  }, [map, uploadedGeoJSON, drawSource]);

  // Expose generateFeatures and clearFeatures methods to parent
  useImperativeHandle(ref, () => ({
    generateFeatures: ({ 
      geometryType, 
      quantity, 
      customAttributes,
      lineLength,
      polygonArea,
      generationArea,
      drawnArea,
      aiPrompt 
    }) => {
      if (!map) return [];

      // Get generation bounds
      let bounds;
      let constrainingPolygon;

      if ((generationArea === 'draw' || generationArea === 'uploaded') && drawnFeatures) {
        // Use drawn polygon for bounds and constraints
        bounds = turf.bbox(drawnFeatures);
        
        // Handle different types of constraining geometries
        if (drawnFeatures.type === 'FeatureCollection') {
          // If it's a FeatureCollection, merge all polygons into one
          const polygons = drawnFeatures.features.filter(f => 
            f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
          );
          
          if (polygons.length === 1) {
            constrainingPolygon = polygons[0];
          } else if (polygons.length > 1) {
            // Union multiple polygons into one
            try {
              constrainingPolygon = turf.union(...polygons);
            } catch (unionError) {
              console.warn('Failed to union polygons, using first polygon:', unionError);
              constrainingPolygon = polygons[0];
            }
          } else {
            console.warn('No polygon features found in FeatureCollection');
            constrainingPolygon = drawnFeatures;
          }
        } else if (drawnFeatures.type === 'Feature') {
          constrainingPolygon = drawnFeatures;
        } else {
          // Assume it's a geometry, wrap it in a feature
          constrainingPolygon = {
            type: 'Feature',
            properties: {},
            geometry: drawnFeatures
          };
        }
      } else {
        // Use current viewport bounds
        const extent = map.getView().calculateExtent(map.getSize());
        const bottomLeft = toLonLat([extent[0], extent[1]]);
        const topRight = toLonLat([extent[2], extent[3]]);
        bounds = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];
      }

      // Generate features based on type
      console.log('Starting generation:', { 
        geometryType, 
        quantity, 
        bounds, 
        constrainingPolygon: !!constrainingPolygon,
        constrainingPolygonType: constrainingPolygon?.type,
        constrainingPolygonGeometryType: constrainingPolygon?.geometry?.type
      });
      
      const features = [];
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < quantity; i++) {
        let feature;
        try {
          switch (geometryType) {
            case 'point':
              feature = generatePoint(bounds, customAttributes, constrainingPolygon);
              break;
            case 'line':
              feature = generateLine(bounds, customAttributes, {
                minLength: lineLength?.min || 100,
                maxLength: lineLength?.max || 1000,
                constrainingPolygon
              });
              break;
            case 'polygon':
              feature = generatePolygon(bounds, customAttributes, {
                minArea: polygonArea?.min || 1000,
                maxArea: polygonArea?.max || 10000,
                constrainingPolygon
              });
              break;
            default:
              feature = null;
          }

          if (feature) {
            features.push(feature);
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Error generating feature ${i}:`, error);
          failCount++;
        }
      }
      
      console.log(`Generation complete: ${successCount} success, ${failCount} failed`);
      
      if (features.length === 0) {
        console.warn('No features were generated. Check bounds and constraints.');
        return [];
      }

      // Update map with generated features
      featuresSource.clear();

      // Convert to OpenLayers features
      const format = new GeoJSON();
      const olFeatures = format.readFeatures({
        type: 'FeatureCollection',
        features
      }, {
        featureProjection: 'EPSG:3857'
      });

      featuresSource.addFeatures(olFeatures);

      return features;
    },
    
    clearFeatures: () => {
      if (featuresSource) {
        featuresSource.clear();
      }
    },
    
    setMapView: ({ center, zoom, bounds, padding = 50 }) => {
      if (!map) return;
      
      const view = map.getView();
      
      if (bounds) {
        // Fit to bounds
        const extent = [
          fromLonLat([bounds[0], bounds[1]]),  // bottom-left
          fromLonLat([bounds[2], bounds[3]])   // top-right
        ];
        const flatExtent = [extent[0][0], extent[0][1], extent[1][0], extent[1][1]];
        
        view.fit(flatExtent, {
          padding: [padding, padding, padding, padding],
          maxZoom: 16
        });
      } else if (center && zoom) {
        // Set center and zoom
        view.setCenter(fromLonLat(center));
        view.setZoom(zoom);
      }
    },
    
    showPreviewFeatures: (geoJSON) => {
      if (!map || !geoJSON) return;
      
      try {
        // Clear existing preview features (but keep generated features)
        const currentFeatures = featuresSource.getFeatures();
        const nonPreviewFeatures = currentFeatures.filter(f => 
          !f.get('preview') // Assuming preview features have a 'preview' property
        );
        
        featuresSource.clear();
        featuresSource.addFeatures(nonPreviewFeatures);
        
        // Add preview features with different styling
        const format = new GeoJSON();
        const previewFeatures = format.readFeatures(geoJSON, {
          featureProjection: 'EPSG:3857'
        });
        
        // Mark as preview and add special styling
        previewFeatures.forEach(feature => {
          feature.set('preview', true);
          feature.setStyle(new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({
                color: 'rgba(34, 197, 94, 0.8)' // green preview
              }),
              stroke: new Stroke({
                color: '#15803d',
                width: 2
              })
            }),
            stroke: new Stroke({
              color: '#15803d',
              width: 3,
              lineDash: [5, 5]
            }),
            fill: new Fill({
              color: 'rgba(34, 197, 94, 0.2)'
            })
          }));
        });
        
        featuresSource.addFeatures(previewFeatures);
        
        console.log(`Added ${previewFeatures.length} preview features to map`);
      } catch (error) {
        console.error('Error showing preview features:', error);
      }
    }
  }), [map, drawnFeatures, featuresSource]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-lg border-4 border-indigo-300"
      style={{ minHeight: '500px' }}
    />
  );
});

GenerateMap.displayName = 'GenerateMap';

export default GenerateMap;