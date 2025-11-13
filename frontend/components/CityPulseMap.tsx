/**
 * CityPulseMap component
 * Main map with MapLibre and deck.gl integration
 */
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Map from "react-map-gl/maplibre";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import type { PickingInfo } from "@deck.gl/core";
import { ViewState, GeoJSONFeatureCollection, GeoJSONFeature } from "@/types";
import { getCSIColor } from "@/lib/colors";
import "maplibre-gl/dist/maplibre-gl.css";

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
  scenarioParams: {
    car: number;
    trees: number;
    transit: number;
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
  scenarioParams,
  onCellClick,
}: CityPulseMapProps) {
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const deckRef = useRef(null);

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const initTimer = setTimeout(() => setIsClient(true), 0);
    const readyTimer = setTimeout(() => setIsReady(true), 300);
    return () => {
      clearTimeout(initTimer);
      clearTimeout(readyTimer);
    };
  }, []);

  // Create deck.gl layers
  const layers = useMemo(() => {
    const layerList: any[] = [];

    // Check if scenario is active
    const isScenarioActive =
      scenarioParams.car !== 0 ||
      scenarioParams.trees !== 0 ||
      scenarioParams.transit !== 0;

    // CSI Grid Layer
    if (
      layersVisible.csi &&
      gridData &&
      gridData.features &&
      gridData.features.length > 0
    ) {
      layerList.push(
        new GeoJsonLayer({
          id: "csi-grid",
          data: gridData as any,
          pickable: true,
          stroked: true,
          filled: true,
          extruded: false,
          opacity: 0.8,
          autoHighlight: true,
          highlightColor: [255, 255, 255, 100],
          getFillColor: (d: any) => {
            // Use scenario CSI when sliders are active, otherwise current CSI
            const csiValue = isScenarioActive
              ? d.properties.csi_scenario
              : d.properties.csi_current;
            const color = getCSIColor(csiValue);
            return [...color.slice(0, 3), 200];
          },
          getLineColor: [80, 80, 80, 100],
          getLineWidth: 1,
          lineWidthMinPixels: 0.5,
          onClick: (info: PickingInfo<GeoJSONFeature>) => {
            if (info.object) {
              onCellClick(info.object.properties.id);
            }
          },
          updateTriggers: {
            getFillColor: [gridData, scenarioParams],
          },
        } as any)
      );
    }

    // Hotspots Layer (highlight high CSI cells)
    if (layersVisible.hotspots && gridData) {
      const hotspotFeatures = {
        type: "FeatureCollection" as const,
        features: gridData.features.filter(
          (f: GeoJSONFeature) => f.properties.csi_current > 70
        ),
      };

      if (hotspotFeatures.features.length > 0) {
        layerList.push(
          new GeoJsonLayer({
            id: "hotspots",
            data: hotspotFeatures as any,
            pickable: false,
            stroked: true,
            filled: false,
            getLineColor: [255, 0, 0, 200],
            getLineWidth: 3,
            lineWidthMinPixels: 2,
          } as any)
        );
      }
    }

    // Trees Layer - only show when zoomed in enough
    if (layersVisible.trees && treesData && treesData.features.length > 0) {
      // Only render trees at zoom level 12 or higher to improve performance
      if (viewState.zoom >= 12) {
        // Sample trees based on zoom level to reduce rendering load (deterministic sampling)
        const samplingRate =
          viewState.zoom >= 14 ? 1 : viewState.zoom >= 13 ? 2 : 4;
        const sampledTrees = treesData.features.filter(
          (_tree, idx) => idx % samplingRate === 0
        );

        layerList.push(
          new ScatterplotLayer({
            id: "trees",
            data: sampledTrees,
            pickable: false,
            opacity: 0.6,
            stroked: false,
            filled: true,
            radiusScale: 1,
            radiusMinPixels: 2,
            radiusMaxPixels: 4,
            getPosition: (d: GeoJSONFeature) => d.geometry.coordinates,
            getFillColor: [34, 139, 34, 150],
          })
        );
      }
    }

    // Planting Sites Layer
    if (
      layersVisible.planting &&
      plantingSitesData &&
      plantingSitesData.features.length > 0
    ) {
      layerList.push(
        new ScatterplotLayer({
          id: "planting-sites",
          data: plantingSitesData.features,
          pickable: true,
          opacity: 0.8,
          stroked: true,
          filled: true,
          radiusScale: 1,
          radiusMinPixels: 3,
          radiusMaxPixels: 6,
          getPosition: (d: GeoJSONFeature) => d.geometry.coordinates,
          getFillColor: [46, 204, 113, 200],
          getLineColor: [39, 174, 96, 255],
          getLineWidth: 1,
        })
      );
    }

    return layerList;
  }, [
    gridData,
    treesData,
    plantingSitesData,
    layersVisible.csi,
    layersVisible.trees,
    layersVisible.planting,
    layersVisible.hotspots,
    scenarioParams,
    onCellClick,
    viewState.zoom,
  ]);

  if (!isClient || !isReady) {
    return (
      <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-white text-sm">Initializing map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <DeckGL
        ref={deckRef}
        viewState={viewState}
        onViewStateChange={(params) =>
          setViewState(params.viewState as ViewState)
        }
        controller={true}
        layers={layers}
        onWebGLInitialized={() => {
          // WebGL initialized successfully
        }}
        onError={(error: Error) => {
          console.error("DeckGL error:", error);
        }}
        getTooltip={(info: PickingInfo) => {
          const { object } = info;
          if (!object) return null;

          if (object.properties) {
            // Grid cell
            return {
              html: `
                <div class="p-2">
                  <div class="font-semibold">Cell ${object.properties.id}</div>
                  <div class="text-sm">CSI: ${Math.round(
                    object.properties.csi_current
                  )}</div>
                </div>
              `,
              style: {
                backgroundColor: "white",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              },
            };
          } else if (object.geometry?.coordinates) {
            // Planting site
            const objectWithProps = object as {
              properties?: { priority_score?: number };
            };
            const priorityScore =
              objectWithProps.properties?.priority_score || 0;
            return {
              html: `
                <div class="p-2">
                  <div class="font-semibold">🌱 Planting Site</div>
                  <div class="text-sm">Priority: ${(
                    priorityScore * 100
                  ).toFixed(0)}%</div>
                </div>
              `,
              style: {
                backgroundColor: "white",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              },
            };
          }
          return null;
        }}
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
      </DeckGL>
    </div>
  );
}
