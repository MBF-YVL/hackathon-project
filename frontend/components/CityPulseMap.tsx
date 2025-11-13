/**
 * CityPulseMap component
 * Main map with Leaflet integration
 */
"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, useMap } from "react-leaflet";
import type { LatLngExpression, PathOptions } from "leaflet";
import * as L from "leaflet";
import { GeoJSONFeatureCollection, GeoJSONFeature } from "@/types";
import { getCSIColor } from "@/lib/colors";
import "leaflet/dist/leaflet.css";

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

const MONTREAL_CENTER: LatLngExpression = [45.508888, -73.567256];
const INITIAL_ZOOM = 11;

// Component to update map when data changes
function MapUpdater({ gridData }: { gridData: GeoJSONFeatureCollection | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (gridData && gridData.features && gridData.features.length > 0) {
      // Fit bounds to show all data
      const bounds = map.getBounds();
      map.fitBounds(bounds);
    }
  }, [gridData, map]);
  
  return null;
}

export default function CityPulseMap({
  gridData,
  treesData,
  plantingSitesData,
  layersVisible,
  onCellClick,
}: CityPulseMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Delay to avoid SSR issues with Leaflet
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isClient) {
    return (
      <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-white text-sm">Initializing map...</div>
      </div>
    );
  }

  // Style function for CSI grid cells
  const gridStyle = (feature?: GeoJSON.Feature): PathOptions => {
    if (!feature || !feature.properties) return {};
    
    const props = feature.properties as { csi_current?: number };
    const csi = props.csi_current || 0;
    const color = getCSIColor(csi);
    const rgbColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    
    return {
      fillColor: rgbColor,
      fillOpacity: 0.7,
      color: 'rgb(80, 80, 80)',
      weight: 1,
      opacity: 0.8,
    };
  };

  // Style function for hotspots
  const hotspotStyle = (): PathOptions => {
    return {
      fillColor: 'transparent',
      fillOpacity: 0,
      color: 'rgb(255, 0, 0)',
      weight: 3,
      opacity: 0.9,
    };
  };

  // Event handlers for grid cells
  const onEachGridCell = (feature: GeoJSON.Feature, layer: L.Layer) => {
    if (!feature.properties) return;
    
    const { id, csi_current } = feature.properties;
    
    // Type guard for Path layer
    if ('bindPopup' in layer && 'on' in layer && 'setStyle' in layer) {
      // Add popup
      layer.bindPopup(`
        <div class="p-2">
          <div class="font-semibold text-sm">Cell ${id}</div>
          <div class="text-xs text-gray-600">CSI: ${Math.round(csi_current)}</div>
          <div class="text-xs text-blue-600 mt-1 cursor-pointer">Click for details</div>
        </div>
      `);
      
      // Add click handler
      layer.on({
        click: () => {
          onCellClick(id);
        },
        mouseover: (e: L.LeafletEvent) => {
          const target = e.target as L.Path;
          target.setStyle({
            weight: 2,
            fillOpacity: 0.9,
          });
        },
        mouseout: (e: L.LeafletEvent) => {
          const target = e.target as L.Path;
          target.setStyle({
            weight: 1,
            fillOpacity: 0.7,
          });
        },
      });
    }
  };

  // Filter hotspots (CSI > 70)
  const hotspotData = gridData && layersVisible.hotspots ? {
    type: "FeatureCollection" as const,
    features: gridData.features.filter(
      (f: GeoJSONFeature) => f.properties.csi_current > 70
    ),
  } : null;

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={MONTREAL_CENTER}
        zoom={INITIAL_ZOOM}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        {/* Base map tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* CSI Grid Layer */}
        {layersVisible.csi && gridData && gridData.features && gridData.features.length > 0 && (
          <GeoJSON
            key={`grid-${JSON.stringify(gridData.features.slice(0, 5))}`}
            data={gridData as GeoJSON.GeoJsonObject}
            style={gridStyle}
            onEachFeature={onEachGridCell}
          />
        )}

        {/* Hotspots Layer */}
        {layersVisible.hotspots && hotspotData && hotspotData.features.length > 0 && (
          <GeoJSON
            key={`hotspots-${hotspotData.features.length}`}
            data={hotspotData as GeoJSON.GeoJsonObject}
            style={hotspotStyle}
          />
        )}

        {/* Trees Layer */}
        {layersVisible.trees && treesData && treesData.features && treesData.features.length > 0 && (
          <>
            {treesData.features.slice(0, 5000).map((tree: GeoJSONFeature, idx: number) => {
              if (!tree.geometry || tree.geometry.type !== 'Point') return null;
              const coords = tree.geometry.coordinates;
              return (
                <CircleMarker
                  key={`tree-${idx}`}
                  center={[coords[1], coords[0]]}
                  radius={2}
                  fillColor="rgb(34, 139, 34)"
                  fillOpacity={0.6}
                  stroke={false}
                />
              );
            })}
          </>
        )}

        {/* Planting Sites Layer */}
        {layersVisible.planting && plantingSitesData && plantingSitesData.features && plantingSitesData.features.length > 0 && (
          <>
            {plantingSitesData.features.slice(0, 2000).map((site: GeoJSONFeature, idx: number) => {
              if (!site.geometry || site.geometry.type !== 'Point') return null;
              const coords = site.geometry.coordinates;
              return (
                <CircleMarker
                  key={`site-${idx}`}
                  center={[coords[1], coords[0]]}
                  radius={3}
                  fillColor="rgb(46, 204, 113)"
                  fillOpacity={0.8}
                  color="rgb(39, 174, 96)"
                  weight={1}
                />
              );
            })}
          </>
        )}

        <MapUpdater gridData={gridData} />
      </MapContainer>
    </div>
  );
}
