/**
 * Map page for CityPulse Montréal 2035
 * Full interactive map application
 */
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Header from "@/components/Header";
import LayerToggles from "@/components/LayerToggles";
import ScenarioControls from "@/components/ScenarioControls";
import CellDetailsPanel from "@/components/CellDetailsPanel";
import { api } from "@/lib/api";
import {
  GeoJSONFeatureCollection,
  CellDetails,
  ScenarioParams,
  LayerVisibility,
} from "@/types";
import { Home } from "lucide-react";

// Dynamically import map to avoid SSR issues
const CityPulseMap = dynamic(() => import("@/components/CityPulseMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <div className="text-xl font-semibold">Loading CityPulse Map...</div>
      </div>
    </div>
  ),
});

export default function MapPage() {
  // State
  const [gridData, setGridData] = useState<GeoJSONFeatureCollection | null>(
    null
  );
  const [treesData, setTreesData] = useState<GeoJSONFeatureCollection | null>(
    null
  );
  const [plantingSitesData, setPlantingSitesData] =
    useState<GeoJSONFeatureCollection | null>(null);
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
  const [narrative, setNarrative] = useState<string>("");
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Determine current scenario
  const currentScenario =
    scenarioParams.car !== 0 ||
    scenarioParams.trees !== 0 ||
    scenarioParams.transit !== 0
      ? "2035"
      : "current";

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Reload grid when scenario params change
  useEffect(() => {
    if (!isLoading) {
      loadGridData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioParams, isLoading]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Load all data in parallel
      const [grid, trees, sites] = await Promise.all([
        api.getGrid(),
        api.getTrees(),
        api.getPlantingSites(),
      ]);

      setGridData(grid);
      setTreesData(trees);
      setPlantingSitesData(sites);
    } catch (err) {
      console.error("Error loading data:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(
        `Failed to load data: ${errorMessage}. Make sure the backend is running on http://localhost:5001`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadGridData = async () => {
    try {
      const grid = await api.getGrid(currentScenario, scenarioParams);
      setGridData(grid);
    } catch (err) {
      console.error("Error loading grid:", err);
    }
  };

  const handleCellClick = async (cellId: string) => {
    try {
      const cellDetails = await api.getCell(cellId);
      setSelectedCell(cellDetails);
    } catch (err) {
      console.error("Error loading cell details:", err);
    }
  };

  // Refresh selected cell when scenario params change
  useEffect(() => {
    const refreshSelectedCell = async () => {
      if (selectedCell) {
        try {
          const cellDetails = await api.getCell(selectedCell.id);
          setSelectedCell(cellDetails);
        } catch (err) {
          console.error("Error refreshing cell details:", err);
        }
      }
    };

    refreshSelectedCell();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioParams]);

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
        setNarrative("No data available to generate narrative.");
        return;
      }

      const csiValues = gridData.features.map(
        (f) => (f.properties as { csi_current: number }).csi_current
      );
      const csiScenarioValues = gridData.features.map((f) => {
        const props = f.properties as {
          csi_scenario?: number;
          csi_current: number;
        };
        return props.csi_scenario || props.csi_current;
      });

      const metrics = {
        avg_csi_current:
          csiValues.reduce((a, b) => a + b, 0) / csiValues.length,
        avg_csi_scenario:
          csiScenarioValues.reduce((a, b) => a + b, 0) /
          csiScenarioValues.length,
        hotspot_count_current: csiValues.filter((v: number) => v > 70).length,
        hotspot_count_scenario: csiScenarioValues.filter((v: number) => v > 70)
          .length,
      };

      const result = await api.getScenarioSummary(scenarioParams, metrics);
      setNarrative(result.narrative);
    } catch (err) {
      console.error("Error generating narrative:", err);
      setNarrative("Failed to generate narrative. Please try again.");
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  return (
    <main className="w-screen h-screen overflow-hidden relative bg-black">
      {/* Navigation */}
      <nav className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        <Link href="/">
          <button className="glass-panel px-5 py-2.5 rounded-full border border-cyan-500/30 hover:border-cyan-500/50 transition-all flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm shadow-lg shadow-cyan-500/20">
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </Link>
        <div className="glass-panel px-5 py-2.5 rounded-full border border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/20">
          <span className="text-cyan-300 font-semibold text-sm">Map</span>
        </div>
      </nav>

      {/* Header */}
      <Header scenario={currentScenario} />

      {/* Map */}
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="text-2xl font-semibold mb-2 text-cyan-400">
              Loading CityPulse Montréal 2035
            </div>
            <div className="text-gray-400">
              Preparing urban stress digital twin...
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="w-full h-full flex items-center justify-center bg-black text-white">
          <div className="text-center max-w-md glass-panel p-8 rounded-2xl border border-red-500/30">
            <div className="text-xl font-semibold mb-2 text-red-400">
              Error Loading Data
            </div>
            <div className="text-gray-300 mb-4">{error}</div>
            <button
              onClick={loadData}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-black rounded-full font-medium transition-colors shadow-lg shadow-cyan-500/50"
            >
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
          scenarioParams={scenarioParams}
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
          gridData={gridData}
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
