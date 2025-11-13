/**
 * Scenario Controls component
 * Sliders for adjusting 2035 scenario parameters
 */
"use client";

import React from "react";
import { ScenarioParams } from "@/types";

interface ScenarioControlsProps {
  params: ScenarioParams;
  onParamsChange: (params: ScenarioParams) => void;
  onGenerateNarrative: () => void;
  narrative?: string;
  isGenerating?: boolean;
}

export default function ScenarioControls({
  params,
  onParamsChange,
  onGenerateNarrative,
  narrative,
  isGenerating = false,
}: ScenarioControlsProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="absolute top-24 left-6 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-200 w-80">
      {/* Header */}
      <div
        className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-t-lg flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold">2035 Scenario Controls</h3>
        <button className="text-white/90 hover:text-white">
          {isExpanded ? "▼" : "▶"}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
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
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? "⏳ Generating..." : "✨ Generate Scenario Story"}
          </button>

          {/* Narrative Display */}
          {narrative && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="text-xs font-semibold text-purple-900 mb-2 uppercase tracking-wider">
                AI Narrative
              </h4>
              <p className="text-sm text-purple-900 leading-relaxed">
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
