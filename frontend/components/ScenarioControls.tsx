/**
 * Scenario Controls component
 * Sliders for adjusting 2035 scenario parameters
 */
"use client";

import React from "react";
import { ScenarioParams, GeoJSONFeatureCollection } from "@/types";

interface ScenarioControlsProps {
  params: ScenarioParams;
  gridData: GeoJSONFeatureCollection | null;
  onParamsChange: (params: ScenarioParams) => void;
  onGenerateNarrative: () => void;
  narrative?: string;
  isGenerating?: boolean;
}

export default function ScenarioControls({
  params,
  gridData,
  onParamsChange,
  onGenerateNarrative,
  narrative,
  isGenerating = false,
}: ScenarioControlsProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  
  // Calculate CSI metrics
  const isScenarioActive = params.car !== 0 || params.trees !== 0 || params.transit !== 0;
  
  const metrics = React.useMemo(() => {
    if (!gridData || !gridData.features || gridData.features.length === 0) {
      return null;
    }
    
    const csiCurrent = gridData.features.map((f: any) => f.properties.csi_current || 0);
    const csiScenario = gridData.features.map((f: any) => f.properties.csi_scenario || 0);
    
    const avgCurrent = csiCurrent.reduce((a, b) => a + b, 0) / csiCurrent.length;
    const avgScenario = csiScenario.reduce((a, b) => a + b, 0) / csiScenario.length;
    const hotspotsCurrent = csiCurrent.filter((v) => v > 70).length;
    const hotspotsScenario = csiScenario.filter((v) => v > 70).length;
    
    return {
      avgCurrent,
      avgScenario,
      reduction: avgCurrent - avgScenario,
      hotspotsCurrent,
      hotspotsScenario,
      hotspotsReduced: hotspotsCurrent - hotspotsScenario,
    };
  }, [gridData]);

  return (
    <div className="absolute top-20 left-6 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border-0 w-80">
      {/* Header */}
      <div
        className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-lg flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold text-sm">2035 Scenario Controls</h3>
        <button className="text-white/90 hover:text-white text-sm">
          {isExpanded ? "▼" : "▶"}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Scenario Impact Summary */}
          {isScenarioActive && metrics && (
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 space-y-2">
              <div className="text-xs font-semibold text-cyan-900 uppercase tracking-wider">
                Scenario Impact
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-xs text-slate-600">Avg CSI</div>
                  <div className="font-semibold text-slate-900">
                    {Math.round(metrics.avgScenario)}
                    <span className="text-xs text-emerald-600 ml-1">
                      ({metrics.reduction > 0 ? '-' : '+'}{Math.abs(Math.round(metrics.reduction))})
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">Hotspots</div>
                  <div className="font-semibold text-slate-900">
                    {metrics.hotspotsScenario}
                    <span className="text-xs text-emerald-600 ml-1">
                      ({metrics.hotspotsReduced > 0 ? '-' : '+'}{Math.abs(metrics.hotspotsReduced)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Car Dependence Slider */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              🚗 Car Dependence Change
            </label>
            <input
              type="range"
              min="-1"
              max="0"
              step="0.1"
              value={params.car}
              onChange={(e) =>
                onParamsChange({ ...params, car: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>-100%</span>
              <span className="font-semibold">
                {params.car === 0
                  ? "No change"
                  : `${Math.round(params.car * 100)}%`}
              </span>
              <span>0%</span>
            </div>
          </div>

          {/* Transit Investment Slider */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              🚇 Transit Investment
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={params.transit}
              onChange={(e) =>
                onParamsChange({
                  ...params,
                  transit: parseFloat(e.target.value),
                })
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>0%</span>
              <span className="font-semibold">
                {params.transit === 0
                  ? "No change"
                  : `+${Math.round(params.transit * 100)}%`}
              </span>
              <span>+100%</span>
            </div>
          </div>

          {/* Tree Investment Slider */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              🌳 Tree/Greening Investment
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={params.trees}
              onChange={(e) =>
                onParamsChange({ ...params, trees: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>0%</span>
              <span className="font-semibold">
                {params.trees === 0
                  ? "No change"
                  : `+${Math.round(params.trees * 100)}%`}
              </span>
              <span>+100%</span>
            </div>
          </div>

          {/* Generate Narrative Button */}
          <button
            onClick={onGenerateNarrative}
            disabled={isGenerating}
            className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? "⏳ Generating..." : "✨ Generate Scenario Story"}
          </button>

          {/* Narrative Display */}
          {narrative && (
            <div className="mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
              <h4 className="text-xs font-semibold text-cyan-900 mb-2 uppercase tracking-wider">
                AI Narrative
              </h4>
              <p className="text-sm text-cyan-900 leading-relaxed">
                {narrative}
              </p>
            </div>
          )}

          {/* Reset Button */}
          {(params.car !== 0 || params.transit !== 0 || params.trees !== 0) && (
            <button
              onClick={() => onParamsChange({ car: 0, trees: 0, transit: 0 })}
              className="w-full py-1.5 px-4 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            >
              Reset to Current
            </button>
          )}
        </div>
      )}
    </div>
  );
}
