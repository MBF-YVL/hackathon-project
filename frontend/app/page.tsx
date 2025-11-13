/**
 * Main page for CityPulse Montréal 2035
 * Integrates all components and manages state
 */
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import LayerToggles from '@/components/LayerToggles';
import ScenarioControls from '@/components/ScenarioControls';
import CellDetailsPanel from '@/components/CellDetailsPanel';
import { api } from '@/lib/api';
import { 
  GeoJSONFeatureCollection, 
  CellDetails, 
  ScenarioParams, 
  LayerVisibility 
} from '@/types';

// Dynamically import map to avoid SSR issues
const CityPulseMap = dynamic(() => import('@/components/CityPulseMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <div className="text-xl font-semibold">Loading CityPulse Map...</div>
      </div>
    </div>
  ),
});

export default function Home() {
  // State
  const [gridData, setGridData] = useState<GeoJSONFeatureCollection | null>(null);
  const [treesData, setTreesData] = useState<GeoJSONFeatureCollection | null>(null);
  const [plantingSitesData, setPlantingSitesData] = useState<GeoJSONFeatureCollection | null>(null);
  const [selectedCell, setSelectedCell] = useState<CellDetails | null>(null);
  const [scenarioParams, setScenarioParams] = useState<ScenarioParams>({
    car: 0,
    trees: 0,
    transit: 0,
  });
  const [layersVisible, setLayersVisible] = useState<LayerVisibility>({
    csi: true,
    trees: false,
    planting: false,
    hotspots: true,
  });
  const [narrative, setNarrative] = useState<string>('');
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Determine current scenario
  const currentScenario = scenarioParams.car !== 0 || scenarioParams.trees !== 0 || scenarioParams.transit !== 0
    ? '2035'
    : 'current';

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Reload grid when scenario params change
  useEffect(() => {
    if (!isLoading) {
      loadGridData();
    }
  }, [scenarioParams]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Load all data in parallel
      const [grid, trees, sites] = await Promise.all([
        api.getGrid(),
        api.getTrees(),
        api.getPlantingSites(),
      ]);

      setGridData(grid);
      setTreesData(trees);
      setPlantingSitesData(sites);
    } catch (err: any) {
      console.error('Error loading data:', err);
      const errorMessage = err.message || 'Unknown error';
      setError(`Failed to load data: ${errorMessage}. Make sure the backend is running on http://localhost:5001`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGridData = async () => {
    try {
      const grid = await api.getGrid(currentScenario as any, scenarioParams);
      setGridData(grid);
    } catch (err) {
      console.error('Error loading grid:', err);
    }
  };

  const handleCellClick = async (cellId: string) => {
    try {
      const cellDetails = await api.getCell(cellId);
      setSelectedCell(cellDetails);
    } catch (err) {
      console.error('Error loading cell details:', err);
    }
  };

  const handleLayerToggle = (layer: keyof LayerVisibility) => {
    setLayersVisible((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const handleGenerateNarrative = async () => {
    try {
      setIsGeneratingNarrative(true);

      // Calculate aggregate metrics from grid
      if (!gridData || gridData.features.length === 0) {
        setNarrative('No data available to generate narrative.');
        return;
      }

      const csiValues = gridData.features.map((f: any) => f.properties.csi_current);
      const csiScenarioValues = gridData.features.map((f: any) => f.properties.csi_scenario || f.properties.csi_current);

      const metrics = {
        avg_csi_current: csiValues.reduce((a, b) => a + b, 0) / csiValues.length,
        avg_csi_scenario: csiScenarioValues.reduce((a, b) => a + b, 0) / csiScenarioValues.length,
        hotspot_count_current: csiValues.filter((v: number) => v > 70).length,
        hotspot_count_scenario: csiScenarioValues.filter((v: number) => v > 70).length,
      };

      const result = await api.getScenarioSummary(scenarioParams, metrics);
      setNarrative(result.narrative);
    } catch (err) {
      console.error('Error generating narrative:', err);
      setNarrative('Failed to generate narrative. Please try again.');
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  return (
    <main className="w-screen h-screen overflow-hidden relative bg-slate-900">
      {/* Header */}
      <Header scenario={currentScenario as any} />

      {/* Map */}
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
          <div className="text-center">
            <svg className="w-24 h-24 mx-auto mb-4 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <div className="text-2xl font-semibold mb-2">Loading CityPulse Montréal 2035</div>
            <div className="text-slate-400">Preparing urban stress digital twin...</div>
          </div>
        </div>
      ) : error ? (
        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
          <div className="text-center max-w-md">
            <svg className="w-24 h-24 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-xl font-semibold mb-2 text-red-400">Error Loading Data</div>
            <div className="text-slate-300 mb-4">{error}</div>
            <button
              onClick={loadData}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          </div>
        </div>
      ) : (
        <CityPulseMap
          gridData={gridData}
          treesData={treesData}
          plantingSitesData={plantingSitesData}
          layersVisible={layersVisible}
          onCellClick={handleCellClick}
        />
      )}

      {/* Layer Toggles */}
      {!isLoading && !error && (
        <LayerToggles layers={layersVisible} onToggle={handleLayerToggle} />
      )}

      {/* Scenario Controls */}
      {!isLoading && !error && (
        <ScenarioControls
          params={scenarioParams}
          onParamsChange={setScenarioParams}
          onGenerateNarrative={handleGenerateNarrative}
          narrative={narrative}
          isGenerating={isGeneratingNarrative}
        />
      )}

      {/* Cell Details Panel */}
      {selectedCell && (
        <CellDetailsPanel
          cell={selectedCell}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </main>
  );
}
