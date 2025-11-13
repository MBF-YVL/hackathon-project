/**
 * CityPulseMap component
 * Main map with MapLibre and deck.gl integration
 */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Map from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { ViewState, GeoJSONFeatureCollection } from '@/types';
import { getCSIColor } from '@/lib/colors';
import 'maplibre-gl/dist/maplibre-gl.css';

interface CityPulseMapProps {
  gridData: GeoJSONFeatureCollection | null;
  treesData: GeoJSONFeatureCollection | null;
  plantingSitesData: GeoJSONFeatureCollection | null;
  layersVisible: {
    csi: boolean;
    trees: boolean;
    planting: boolean;
    hotspots: boolean;
  };
  onCellClick: (cellId: string) => void;
}

const INITIAL_VIEW_STATE: ViewState = {
  longitude: -73.567256,
  latitude: 45.508888,
  zoom: 11,
  pitch: 0,
  bearing: 0,
};

export default function CityPulseMap({
  gridData,
  treesData,
  plantingSitesData,
  layersVisible,
  onCellClick,
}: CityPulseMapProps) {
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Create deck.gl layers
  const layers = useMemo(() => {
    const layerList: any[] = [];

    // CSI Grid Layer
    if (layersVisible.csi && gridData) {
      layerList.push(
        new GeoJsonLayer({
          id: 'csi-grid',
          data: gridData,
          pickable: true,
          stroked: true,
          filled: true,
          extruded: false,
          getFillColor: (d: any) => getCSIColor(d.properties.csi_current),
          getLineColor: [200, 200, 200, 50],
          getLineWidth: 1,
          lineWidthMinPixels: 0.5,
          onClick: (info: any) => {
            if (info.object) {
              onCellClick(info.object.properties.id);
            }
          },
          onHover: (info: any) => {
            setHoverInfo(info.object ? info : null);
          },
          updateTriggers: {
            getFillColor: [gridData],
          },
        })
      );
    }

    // Hotspots Layer (highlight high CSI cells)
    if (layersVisible.hotspots && gridData) {
      const hotspotFeatures = {
        type: 'FeatureCollection',
        features: gridData.features.filter((f: any) => f.properties.csi_current > 70),
      };

      if (hotspotFeatures.features.length > 0) {
        layerList.push(
          new GeoJsonLayer({
            id: 'hotspots',
            data: hotspotFeatures,
            pickable: false,
            stroked: true,
            filled: false,
            getLineColor: [255, 0, 0, 200],
            getLineWidth: 3,
            lineWidthMinPixels: 2,
          })
        );
      }
    }

    // Trees Layer
    if (layersVisible.trees && treesData && treesData.features.length > 0) {
      layerList.push(
        new ScatterplotLayer({
          id: 'trees',
          data: treesData.features,
          pickable: false,
          opacity: 0.6,
          stroked: false,
          filled: true,
          radiusScale: 1,
          radiusMinPixels: 2,
          radiusMaxPixels: 4,
          getPosition: (d: any) => d.geometry.coordinates,
          getFillColor: [34, 139, 34, 150],
        })
      );
    }

    // Planting Sites Layer
    if (layersVisible.planting && plantingSitesData && plantingSitesData.features.length > 0) {
      layerList.push(
        new ScatterplotLayer({
          id: 'planting-sites',
          data: plantingSitesData.features,
          pickable: true,
          opacity: 0.8,
          stroked: true,
          filled: true,
          radiusScale: 1,
          radiusMinPixels: 3,
          radiusMaxPixels: 6,
          getPosition: (d: any) => d.geometry.coordinates,
          getFillColor: [46, 204, 113, 200],
          getLineColor: [39, 174, 96, 255],
          getLineWidth: 1,
          onHover: (info: any) => {
            if (info.object) {
              setHoverInfo(info);
            }
          },
        })
      );
    }

    return layerList;
  }, [gridData, treesData, plantingSitesData, layersVisible, onCellClick]);

  if (!isClient) {
    return <div className="relative w-full h-full bg-gray-900" />;
  }

  return (
    <div className="relative w-full h-full">
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState }: any) => setViewState(viewState)}
        controller={true}
        layers={layers}
        parameters={{
          depthTest: false,
          blend: true,
          blendFunc: ['SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA', 'ONE', 'ONE_MINUS_SRC_ALPHA'],
          blendEquation: 'FUNC_ADD',
        }}
        getTooltip={({ object }: any) => {
          if (!object) return null;
          
          if (object.properties) {
            // Grid cell
            return {
              html: `
                <div class="p-2">
                  <div class="font-semibold">Cell ${object.properties.id}</div>
                  <div class="text-sm">CSI: ${Math.round(object.properties.csi_current)}</div>
                </div>
              `,
              style: {
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              },
            };
          } else if (object.geometry?.coordinates) {
            // Planting site
            return {
              html: `
                <div class="p-2">
                  <div class="font-semibold">🌱 Planting Site</div>
                  <div class="text-sm">Priority: ${(object.properties?.priority_score * 100 || 0).toFixed(0)}%</div>
                </div>
              `,
              style: {
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              },
            };
          }
          return null;
        }}
      >
        <Map
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          attributionControl={true}
        />
      </DeckGL>
    </div>
  );
}

