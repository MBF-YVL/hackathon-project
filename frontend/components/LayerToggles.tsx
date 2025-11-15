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
  return (
    <div className="absolute bottom-6 left-6 z-10 glass-panel rounded-2xl shadow-2xl border border-cyan-500/30 w-64">
      <div className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">
          Map Layers
        </h3>
        
        {/* Layer toggles */}
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-cyan-500/10 p-2 rounded-lg transition-colors group">
            <input
              type="checkbox"
              checked={layers.csi}
              onChange={() => onToggle("csi")}
              className="w-4 h-4 rounded border-cyan-500/50 bg-black/50 text-cyan-500 focus:ring-cyan-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-300 group-hover:text-cyan-300 transition-colors">CSI Grid</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer hover:bg-cyan-500/10 p-2 rounded-lg transition-colors group">
            <input
              type="checkbox"
              checked={layers.trees}
              onChange={() => onToggle("trees")}
              className="w-4 h-4 rounded border-cyan-500/50 bg-black/50 text-green-500 focus:ring-green-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-300 group-hover:text-cyan-300 transition-colors">Trees</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer hover:bg-cyan-500/10 p-2 rounded-lg transition-colors group">
            <input
              type="checkbox"
              checked={layers.planting}
              onChange={() => onToggle("planting")}
              className="w-4 h-4 rounded border-cyan-500/50 bg-black/50 text-emerald-500 focus:ring-emerald-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-300 group-hover:text-cyan-300 transition-colors">Planting Sites</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer hover:bg-cyan-500/10 p-2 rounded-lg transition-colors group">
            <input
              type="checkbox"
              checked={layers.hotspots}
              onChange={() => onToggle("hotspots")}
              className="w-4 h-4 rounded border-cyan-500/50 bg-black/50 text-red-500 focus:ring-red-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-300 group-hover:text-cyan-300 transition-colors">Hotspots</span>
          </label>
        </div>

        {/* CSI Legend */}
        {layers.csi && (
          <div className="pt-4 border-t border-cyan-500/20">
            <h4 className="text-xs font-semibold text-cyan-400 mb-3 uppercase tracking-wider">
              CSI Scale
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded border border-cyan-500/30"
                  style={{ backgroundColor: "rgb(100, 180, 100)" }}
                ></div>
                <span className="text-xs text-gray-400">0-40: Low Stress</span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded border border-cyan-500/30"
                  style={{ backgroundColor: "rgb(220, 200, 70)" }}
                ></div>
                <span className="text-xs text-gray-400">
                  40-65: Moderate
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded border border-cyan-500/30"
                  style={{ backgroundColor: "rgb(220, 20, 60)" }}
                ></div>
                <span className="text-xs text-gray-400">65-100: High Stress</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
