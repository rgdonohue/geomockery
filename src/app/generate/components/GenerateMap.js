'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { XYZ, Vector as VectorSource } from 'ol/source';
import { Draw } from 'ol/interaction';
import { GeoJSON } from 'ol/format';
import * as olControl from 'ol/control';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';
import * as turf from '@turf/turf';
import { generatePoint, generateLine, generatePolygon, generateUtilityNetwork } from '@/lib/geo/generators';
import { setSeed, getActiveSeed } from '@/lib/utils/random';

function flattenPolygonFeatures(geoJSON) {
  if (!geoJSON) {
    return [];
  }

  if (geoJSON.type === 'FeatureCollection') {
    return geoJSON.features.filter((feature) => ['Polygon', 'MultiPolygon'].includes(feature?.geometry?.type));
  }

  if (geoJSON.type === 'Feature' && ['Polygon', 'MultiPolygon'].includes(geoJSON.geometry?.type)) {
    return [geoJSON];
  }

  if (['Polygon', 'MultiPolygon'].includes(geoJSON.type)) {
    return [{ type: 'Feature', properties: {}, geometry: geoJSON }];
  }

  return [];
}

function mergePolygonFeatures(features) {
  if (!features.length) {
    return null;
  }

  if (features.length === 1) {
    return features[0];
  }

  try {
    let merged = features[0];
    for (let index = 1; index < features.length; index++) {
      const unioned = turf.union(turf.featureCollection([merged, features[index]]));
      if (unioned) {
        merged = unioned;
      }
    }
    return merged;
  } catch (error) {
    console.warn('Failed to merge polygon features, using first polygon:', error);
    return features[0];
  }
}

function hasFiniteExtent(extent) {
  return Array.isArray(extent) && extent.length === 4 && extent.every((value) => Number.isFinite(value));
}

const GenerateMap = forwardRef(({
  generationArea,
  onDrawingComplete,
  onExclusionDrawComplete,
  uploadedGeoJSON,
  excludedGeoJSON,
  activeDrawTarget
}, ref) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const drawInteractionRef = useRef(null);
  const drawnFeaturesRef = useRef(null);
  const featuresSourceRef = useRef(new VectorSource());
  const drawSourceRef = useRef(new VectorSource());
  const constraintSourceRef = useRef(new VectorSource());
  const overlaySourceRef = useRef(new VectorSource());
  const [mapReady, setMapReady] = useState(false);
  const [drawnFeatures, setDrawnFeatures] = useState(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) {
      return;
    }

    const baseLayer = new TileLayer({
      source: new XYZ({
        urls: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        ],
        attributions:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }),
      visible: true,
    });

    const featuresLayer = new VectorLayer({
      source: featuresSourceRef.current,
      style: (feature) => {
        const geomType = feature.getGeometry().getType();
        const segmentRole = feature.get('segment_role');

        if (geomType === 'Point') {
          return [
            new Style({
              image: new CircleStyle({
                radius: 9,
                fill: new Fill({ color: 'rgba(129, 140, 248, 0.18)' }),
              })
            }),
            new Style({
              image: new CircleStyle({
                radius: 3.5,
                fill: new Fill({ color: '#c7d2fe' }),
              })
            }),
          ];
        }

        if (geomType === 'LineString') {
          const color =
            segmentRole === 'backbone' ? '#ffffff' :
            segmentRole === 'loop' ? '#67e8f9' :
            '#c4b5fd';
          const width =
            segmentRole === 'backbone' ? 3 :
            segmentRole === 'loop' ? 2.2 :
            2.4;

          return [
            new Style({
              stroke: new Stroke({
                color: 'rgba(15, 23, 42, 0.75)',
                width: width + 1.6
              })
            }),
            new Style({
              stroke: new Stroke({
                color,
                width,
                lineDash: segmentRole === 'loop' ? [6, 4] : undefined
              })
            })
          ];
        }

        return new Style({
          fill: new Fill({ color: 'rgba(129, 140, 248, 0.22)' }),
          stroke: new Stroke({ color: '#c7d2fe', width: 2.2 })
        });
      }
    });

    const constraintLayer = new VectorLayer({
      source: constraintSourceRef.current,
      style: new Style({
        fill: new Fill({
          color: 'rgba(239, 68, 68, 0.22)'
        }),
        stroke: new Stroke({
          color: '#f87171',
          width: 2.4,
          lineDash: [8, 4]
        })
      })
    });

    const overlayLayer = new VectorLayer({
      source: overlaySourceRef.current,
      style: (feature) => {
        if (feature.get('_overlayType') !== 'anchor') {
          return null;
        }

        return [
          new Style({
            image: new CircleStyle({
              radius: 10,
              fill: new Fill({ color: 'rgba(56, 189, 248, 0.18)' }),
            })
          }),
          new Style({
            image: new CircleStyle({
              radius: 4,
              fill: new Fill({ color: '#38bdf8' }),
              stroke: new Stroke({ color: '#ecfeff', width: 1.5 })
            })
          })
        ];
      }
    });

    const drawLayer = new VectorLayer({
      source: drawSourceRef.current,
      style: new Style({
        fill: new Fill({
          color: 'rgba(67, 56, 202, 0.22)'
        }),
        stroke: new Stroke({
          color: '#6366f1',
          width: 2.6
        }),
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: '#6366f1'
          })
        })
      })
    });

    const map = new Map({
      target: mapContainer.current,
      layers: [baseLayer, constraintLayer, featuresLayer, overlayLayer, drawLayer],
      view: new View({
        center: fromLonLat([-98, 39]),
        zoom: 4
      }),
      controls: olControl.defaults({
        zoom: true,
        rotate: false,
        attribution: true,
      })
    });

    mapRef.current = map;
    setMapReady(true);

    [0, 120, 500, 1000].forEach((delay) => {
      window.setTimeout(() => {
        map.updateSize();
      }, delay);
    });

    const handleWindowResize = () => {
      requestAnimationFrame(() => {
        map.updateSize();
      });
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);

      if (drawInteractionRef.current) {
        map.removeInteraction(drawInteractionRef.current);
        drawInteractionRef.current = null;
      }

      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) {
      return;
    }

    if (drawInteractionRef.current) {
      map.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }

    if (activeDrawTarget === 'boundary') {
      const draw = new Draw({
        source: drawSourceRef.current,
        type: 'Polygon'
      });

      draw.on('drawstart', () => {
        drawSourceRef.current.clear();
        drawnFeaturesRef.current = null;
        setDrawnFeatures(null);
      });

      draw.on('drawend', (evt) => {
        const format = new GeoJSON();
        const geoJSON = format.writeFeatureObject(evt.feature, {
          featureProjection: 'EPSG:3857',
          dataProjection: 'EPSG:4326'
        });

        drawnFeaturesRef.current = geoJSON;
        setDrawnFeatures(geoJSON);
        onDrawingComplete(geoJSON);

        const extent = drawSourceRef.current.getExtent();
        if (hasFiniteExtent(extent)) {
          map.getView().fit(extent, {
            padding: [48, 48, 48, 48],
            maxZoom: 14,
            duration: 150
          });
        }
      });

      map.addInteraction(draw);
      drawInteractionRef.current = draw;
    } else if (activeDrawTarget === 'exclusion') {
      const draw = new Draw({
        source: constraintSourceRef.current,
        type: 'Polygon'
      });

      draw.on('drawend', (evt) => {
        const format = new GeoJSON();
        const geoJSON = format.writeFeatureObject(evt.feature, {
          featureProjection: 'EPSG:3857',
          dataProjection: 'EPSG:4326'
        });

        onExclusionDrawComplete?.({
          type: 'FeatureCollection',
          features: [geoJSON]
        });
      });

      map.addInteraction(draw);
      drawInteractionRef.current = draw;
    }

    return () => {
      if (drawInteractionRef.current) {
        map.removeInteraction(drawInteractionRef.current);
        drawInteractionRef.current = null;
      }
    };
  }, [mapReady, activeDrawTarget, onDrawingComplete, onExclusionDrawComplete]);

  useEffect(() => {
    if (generationArea !== 'viewport') {
      return;
    }

    if (drawSourceRef.current.getFeatures().length > 0) {
      drawSourceRef.current.clear();
    }

    if (drawnFeaturesRef.current) {
      drawnFeaturesRef.current = null;
      setDrawnFeatures(null);
      onDrawingComplete(null);
    }
  }, [generationArea, onDrawingComplete]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !uploadedGeoJSON) {
      return;
    }

    try {
      drawSourceRef.current.clear();
      drawnFeaturesRef.current = null;
      setDrawnFeatures(null);

      const format = new GeoJSON();
      const features = format.readFeatures(uploadedGeoJSON, {
        featureProjection: 'EPSG:3857'
      });

      drawSourceRef.current.addFeatures(features);

      const extent = drawSourceRef.current.getExtent();
      if (hasFiniteExtent(extent)) {
        map.getView().fit(extent, {
          padding: [48, 48, 48, 48],
          maxZoom: 14,
          duration: 150
        });
      }

      drawnFeaturesRef.current = uploadedGeoJSON;
      setDrawnFeatures(uploadedGeoJSON);
    } catch (error) {
      console.error('Error processing uploaded GeoJSON:', error);
    }
  }, [mapReady, uploadedGeoJSON]);

  useEffect(() => {
    if (!mapReady) {
      return;
    }

    constraintSourceRef.current.clear();

    if (!excludedGeoJSON) {
      return;
    }

    try {
      const format = new GeoJSON();
      const features = format.readFeatures(excludedGeoJSON, {
        featureProjection: 'EPSG:3857'
      });
      constraintSourceRef.current.addFeatures(features);
    } catch (error) {
      console.error('Error processing exclusion GeoJSON:', error);
    }
  }, [mapReady, excludedGeoJSON]);

  useImperativeHandle(ref, () => ({
    generateFeatures: ({
      geometryType,
      quantity,
      customAttributes,
      lineLength,
      polygonArea,
      generationArea: generationAreaSetting,
      lineWorkflowMode,
      utilityNetworkSettings,
      aiPrompt,
      seed
    }) => {
      const map = mapRef.current;
      if (!mapReady || !map) {
        return { features: [], metadata: null, warnings: ['Map not ready yet.'] };
      }

      const activeSeed = setSeed(seed);

      let bounds;
      let constrainingPolygon = null;

      if ((generationAreaSetting === 'draw' || generationAreaSetting === 'uploaded') && drawnFeaturesRef.current) {
        bounds = turf.bbox(drawnFeaturesRef.current);
        constrainingPolygon = mergePolygonFeatures(flattenPolygonFeatures(drawnFeaturesRef.current));
      } else {
        const extent = map.getView().calculateExtent(map.getSize());
        const bottomLeft = toLonLat([extent[0], extent[1]]);
        const topRight = toLonLat([extent[2], extent[3]]);
        bounds = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];
      }

      const exclusionPolygons = flattenPolygonFeatures(excludedGeoJSON);
      let features = [];
      let metadata = null;
      let warnings = [];

      try {
        if (geometryType === 'line' && lineWorkflowMode === 'utility') {
          const networkResult = generateUtilityNetwork(bounds, customAttributes, {
            ...utilityNetworkSettings,
            quantity: Math.min(quantity, 250),
            constrainingPolygon,
            exclusionPolygons,
            sourcePrompt: aiPrompt?.trim() || ''
          });
          features = networkResult.features;
          metadata = { ...(networkResult.metadata || {}), seed: activeSeed };
          warnings = networkResult.warnings || [];
        } else {
          let failCount = 0;

          for (let index = 0; index < quantity; index++) {
            let feature = null;

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
            }

            if (feature) {
              features.push(feature);
            } else {
              failCount++;
            }
          }

          metadata = {
            geometryType,
            workflowMode: geometryType === 'line' ? 'basic' : 'standard',
            generatedSegments: geometryType === 'line' ? features.length : undefined,
            targetSegments: geometryType === 'line' ? quantity : undefined,
            exclusionsUsed: exclusionPolygons.length,
            seed: activeSeed,
            syntheticNotice:
              geometryType === 'line'
                ? 'Basic line mode emits simple synthetic segments and is best used for rough demos.'
                : geometryType === 'polygon'
                ? 'Polygon mode emits basic synthetic areas for testing and demos.'
                : 'Point mode emits synthetic point data for testing and demos.',
            generationFailures: failCount
          };

          if (failCount > 0) {
            warnings.push(`Skipped ${failCount} feature${failCount === 1 ? '' : 's'} because they could not satisfy the current boundary constraints.`);
          }
        }
      } catch (error) {
        console.error('Error during generation:', error);
        return {
          features: [],
          metadata,
          warnings: ['Generation failed. Check the current settings and try again.']
        };
      }

      featuresSourceRef.current.clear();
      overlaySourceRef.current.clear();

      if (!features.length) {
        return { features: [], metadata, warnings };
      }

      const format = new GeoJSON();
      const olFeatures = format.readFeatures({
        type: 'FeatureCollection',
        features
      }, {
        featureProjection: 'EPSG:3857'
      });

      featuresSourceRef.current.addFeatures(olFeatures);

      const generatedExtent = featuresSourceRef.current.getExtent();
      if (hasFiniteExtent(generatedExtent)) {
        map.getView().fit(generatedExtent, {
          padding: [48, 48, 48, 48],
          maxZoom: 16,
          duration: 250
        });
      }

      if (metadata?.anchorPoints?.length) {
        const anchorFeatures = format.readFeatures({
          type: 'FeatureCollection',
          features: metadata.anchorPoints.map((feature) => ({
            ...feature,
            properties: {
              ...feature.properties,
              _overlayType: 'anchor'
            }
          }))
        }, {
          featureProjection: 'EPSG:3857'
        });

        overlaySourceRef.current.addFeatures(anchorFeatures);
      }

      map.renderSync();

      return { features, metadata, warnings };
    },

    clearFeatures: () => {
      featuresSourceRef.current.clear();
      overlaySourceRef.current.clear();
      mapRef.current?.renderSync();
    },

    setMapView: ({ center, zoom, bounds, padding = 50 }) => {
      const map = mapRef.current;
      if (!mapReady || !map) return;

      const view = map.getView();

      if (bounds) {
        const extent = [
          fromLonLat([bounds[0], bounds[1]]),
          fromLonLat([bounds[2], bounds[3]])
        ];
        const flatExtent = [extent[0][0], extent[0][1], extent[1][0], extent[1][1]];

        view.fit(flatExtent, {
          padding: [padding, padding, padding, padding],
          maxZoom: 16
        });
      } else if (center && zoom) {
        view.setCenter(fromLonLat(center));
        view.setZoom(zoom);
      }
    },

    showPreviewFeatures: (geoJSON) => {
      const map = mapRef.current;
      if (!mapReady || !map || !geoJSON) return;

      try {
        const currentFeatures = featuresSourceRef.current.getFeatures();
        const nonPreviewFeatures = currentFeatures.filter((feature) => !feature.get('preview'));

        featuresSourceRef.current.clear();
        featuresSourceRef.current.addFeatures(nonPreviewFeatures);

        const format = new GeoJSON();
        const previewFeatures = format.readFeatures(geoJSON, {
          featureProjection: 'EPSG:3857'
        });

        previewFeatures.forEach((feature) => {
          feature.set('preview', true);
          feature.setStyle(new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({
                color: 'rgba(34, 197, 94, 0.85)'
              }),
              stroke: new Stroke({
                color: '#15803d',
                width: 2
              })
            }),
            stroke: new Stroke({
              color: '#22c55e',
              width: 3,
              lineDash: [5, 5]
            }),
            fill: new Fill({
              color: 'rgba(34, 197, 94, 0.2)'
            })
          }));
        });

        featuresSourceRef.current.addFeatures(previewFeatures);
        map.renderSync();
      } catch (error) {
        console.error('Error showing preview features:', error);
      }
    }
  }), [mapReady, excludedGeoJSON]);

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-sm border-2 border-indigo-200 shadow-sm"
      style={{
        background:
          'radial-gradient(circle at 20% 20%, rgba(30,41,59,0.92), rgba(2,6,23,0.98) 55%), repeating-linear-gradient(0deg, rgba(148,163,184,0.06), rgba(148,163,184,0.06) 1px, transparent 1px, transparent 64px), repeating-linear-gradient(90deg, rgba(148,163,184,0.06), rgba(148,163,184,0.06) 1px, transparent 1px, transparent 64px)'
      }}
    >
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />

      <div className="pointer-events-none absolute left-4 bottom-4 max-w-[260px]">
        <div className="border border-slate-700/70 bg-slate-900/85 px-3 py-2.5 backdrop-blur-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Basemap + vectors
          </div>
          <p className="mt-1 text-xs text-slate-300">
            CARTO Dark Matter underlies boundaries, no-go zones, and generated features. The grid behind the canvas is a fallback if tiles are slow or unavailable.
          </p>
        </div>
      </div>
    </div>
  );
});

GenerateMap.displayName = 'GenerateMap';

export default GenerateMap;
