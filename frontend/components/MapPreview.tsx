/**
 * MapPreview component
 * Lightweight embedded map preview for landing page
 */
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { GeoJSONFeatureCollection } from '@/types';

const CityPulseMap = dynamic(() => import('@/components/CityPulseMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <div className="text-2xl font-semibold">Loading Map...</div>
      </div>
    </div>
  ),
});

export default function MapPreview() {
  const [gridData, setGridData] = useState<GeoJSONFeatureCollection | null>(null);
  const [treesData, setTreesData] = useState<GeoJSONFeatureCollection | null>(null);
  const [plantingSitesData, setPlantingSitesData] = useState<GeoJSONFeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [grid, trees, sites] = await Promise.all([
          api.getGrid(),
          api.getTrees(),
          api.getPlantingSites(),
        ]);

        setGridData(grid);
        setTreesData(trees);
        setPlantingSitesData(sites);
      } catch (err) {
        console.error('Error loading preview data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white rounded-2xl">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Loading Map Preview...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-2xl">
      <CityPulseMap
        gridData={gridData}
        treesData={treesData}
        plantingSitesData={plantingSitesData}
        layersVisible={{
          csi: true,
          trees: false,
          planting: false,
          hotspots: true,
        }}
        scenarioParams={{
          car: 0,
          trees: 0,
          transit: 0,
        }}
        onCellClick={() => {}} // No-op for preview
      />
    </div>
  );
}

