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
    <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border-0 w-60">
      <div className="p-4 space-y-3">
        {/* Layer toggles */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded">
            <input
              type="checkbox"
              checked={layers.csi}
              onChange={() => onToggle("csi")}
              className="w-3.5 h-3.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="text-xs font-medium text-slate-700">CSI Grid</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded">
            <input
              type="checkbox"
              checked={layers.trees}
              onChange={() => onToggle("trees")}
              className="w-3.5 h-3.5 rounded border-slate-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-xs font-medium text-slate-700">🌳 Trees</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded">
            <input
              type="checkbox"
              checked={layers.planting}
              onChange={() => onToggle("planting")}
              className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-medium text-slate-700">
              🌱 Planting
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded">
            <input
              type="checkbox"
              checked={layers.hotspots}
              onChange={() => onToggle("hotspots")}
              className="w-3.5 h-3.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-xs font-medium text-slate-700">
              🔥 Hotspots
            </span>
          </label>
        </div>

        {/* CSI Legend */}
        {layers.csi && (
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              CSI Scale
            </h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: "rgb(100, 180, 100)" }}
                ></div>
                <span className="text-[11px] text-slate-600">0-40: Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: "rgb(220, 200, 70)" }}
                ></div>
                <span className="text-[11px] text-slate-600">
                  40-70: Moderate
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: "rgb(220, 20, 60)" }}
                ></div>
                <span className="text-[11px] text-slate-600">70-100: High</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
