/**
 * Layer Toggles component
 * Controls for showing/hiding map layers and CSI legend
 */
"use client";

import React from "react";
import { LayerVisibility } from "@/types";

interface LayerTogglesProps {
  layers: LayerVisibility;
  onToggle: (layer: keyof LayerVisibility) => void;
}

export default function LayerToggles({ layers, onToggle }: LayerTogglesProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-200 max-w-xs">
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold text-slate-900">Map Layers</h3>
        <button className="text-slate-500 hover:text-slate-700">
          {isExpanded ? "▼" : "▶"}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Layer toggles */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input
                type="checkbox"
                checked={layers.csi}
                onChange={() => onToggle("csi")}
                className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm font-medium text-slate-700">
                City Stress Index (CSI)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input
                type="checkbox"
                checked={layers.trees}
                onChange={() => onToggle("trees")}
                className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-slate-700">
                🌳 Existing Trees
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input
                type="checkbox"
                checked={layers.planting}
                onChange={() => onToggle("planting")}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-700">
                🌱 Planting Sites
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded">
              <input
                type="checkbox"
                checked={layers.hotspots}
                onChange={() => onToggle("hotspots")}
                className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-slate-700">
                🔥 Stress Hotspots
              </span>
            </label>
          </div>

          {/* CSI Legend */}
          {layers.csi && (
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                CSI Scale
              </h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "rgb(34, 139, 34)" }}
                  ></div>
                  <span className="text-xs text-slate-600">
                    0-20: Low stress
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "rgb(144, 238, 144)" }}
                  ></div>
                  <span className="text-xs text-slate-600">
                    20-40: Moderate-low
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "rgb(255, 255, 0)" }}
                  ></div>
                  <span className="text-xs text-slate-600">
                    40-60: Moderate
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "rgb(255, 165, 0)" }}
                  ></div>
                  <span className="text-xs text-slate-600">60-80: High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: "rgb(220, 20, 60)" }}
                  ></div>
                  <span className="text-xs text-slate-600">
                    80-100: Critical
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
