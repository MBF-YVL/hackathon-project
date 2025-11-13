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
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span>Car Dependence Change</span>
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
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Transit Investment</span>
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
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>Tree/Greening Investment</span>
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
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Generate Scenario Story</span>
              </>
            )}
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
