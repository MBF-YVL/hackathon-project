/**
 * Scenario Controls component
 * Sliders for adjusting 2035 scenario parameters
 * Draggable and resizable
 */
"use client";

import React, { useRef, useState, useEffect } from "react";
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
  const [isExpanded, setIsExpanded] = useState(true);
  const [position, setPosition] = useState({ x: 24, y: 80 }); // Left side default
  const [size, setSize] = useState({ width: 320, height: 0 }); // Auto height
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Calculate CSI metrics
  const isScenarioActive =
    params.car !== 0 || params.trees !== 0 || params.transit !== 0;

  const metrics = React.useMemo(() => {
    if (!gridData || !gridData.features || gridData.features.length === 0) {
      return null;
    }

    const csiCurrent = gridData.features.map(
      (f: any) => f.properties.csi_current || 0
    );
    const csiScenario = gridData.features.map(
      (f: any) => f.properties.csi_scenario || 0
    );

    const avgCurrent =
      csiCurrent.reduce((a, b) => a + b, 0) / csiCurrent.length;
    const avgScenario =
      csiScenario.reduce((a, b) => a + b, 0) / csiScenario.length;
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

  // Drag handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - (size.width || 320);
      const maxY = window.innerHeight - 100;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, size.width]);

  // Resize handlers
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = Math.max(280, Math.min(500, resizeStart.width + deltaX));
      const newHeight = Math.max(300, Math.min(800, resizeStart.height + deltaY));
      
      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeStart]);

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking the expand/collapse button or its children
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height || (panelRef.current?.offsetHeight || 400),
    });
  };

  return (
    <div
      ref={panelRef}
      className="absolute z-10 glass-panel rounded-2xl shadow-2xl border border-cyan-500/30 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: size.width ? `${size.width}px` : "320px",
        height: size.height ? `${size.height}px` : "auto",
        maxHeight: size.height ? `${size.height}px` : "calc(100vh - 8rem)",
      }}
    >
      {/* Header - Draggable */}
      <div
        ref={headerRef}
        className="px-5 py-3 bg-cyan-500/10 text-cyan-400 border-b border-cyan-500/20 rounded-t-2xl flex items-center justify-between cursor-move hover:bg-cyan-500/15 transition-colors"
        onMouseDown={handleHeaderMouseDown}
      >
        <h3 className="font-bold text-sm uppercase tracking-wider">2035 Scenario Controls</h3>
        <button
          className="text-cyan-400 hover:text-cyan-300 text-lg font-bold transition-colors cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? "▼" : "▶"}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div
          className="p-5 space-y-5 overflow-y-auto custom-scrollbar"
          style={{
            maxHeight: size.height ? `${size.height - 60}px` : "calc(100vh - 8rem)",
          }}
        >
          {/* Scenario Impact Summary */}
          {isScenarioActive && metrics && (
            <div className="glass-panel border border-cyan-500/30 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Scenario Impact
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Avg CSI</div>
                  <div className="font-bold text-white text-lg">
                    {Math.round(metrics.avgScenario)}
                    <span className="text-xs text-cyan-400 ml-1">
                      ({metrics.reduction > 0 ? "-" : "+"}
                      {Math.abs(Math.round(metrics.reduction))})
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Hotspots</div>
                  <div className="font-bold text-white text-lg">
                    {metrics.hotspotsScenario}
                    <span className="text-xs text-cyan-400 ml-1">
                      ({metrics.hotspotsReduced > 0 ? "-" : "+"}
                      {Math.abs(metrics.hotspotsReduced)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Car Dependence Slider */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-3">
              Car Dependence Change
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
              className="slider-futuristic w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(220, 20, 60) 0%, rgb(220, 20, 60) ${((params.car + 1) * 100)}%, rgba(0, 255, 255, 0.2) ${((params.car + 1) * 100)}%, rgba(0, 255, 255, 0.2) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>-100%</span>
              <span className="font-semibold text-cyan-400">
                {params.car === 0
                  ? "No change"
                  : `${Math.round(params.car * 100)}%`}
              </span>
              <span>0%</span>
            </div>
          </div>

          {/* Transit Investment Slider */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-3">
              Transit Investment
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
              className="slider-futuristic w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(0, 150, 255) 0%, rgb(0, 150, 255) ${params.transit * 100}%, rgba(0, 255, 255, 0.2) ${params.transit * 100}%, rgba(0, 255, 255, 0.2) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>0%</span>
              <span className="font-semibold text-cyan-400">
                {params.transit === 0
                  ? "No change"
                  : `+${Math.round(params.transit * 100)}%`}
              </span>
              <span>+100%</span>
            </div>
          </div>

          {/* Tree Investment Slider */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-3">
              Tree/Greening Investment
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
              className="slider-futuristic w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(34, 197, 94) 0%, rgb(34, 197, 94) ${params.trees * 100}%, rgba(0, 255, 255, 0.2) ${params.trees * 100}%, rgba(0, 255, 255, 0.2) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>0%</span>
              <span className="font-semibold text-cyan-400">
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
            className="w-full py-3 px-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-cyan-500/50 hover:border-cyan-500/70 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
          >
            {isGenerating ? "Generating..." : "Generate Scenario Story"}
          </button>

          {/* Narrative Display */}
          {narrative && (
            <div className="mt-4 glass-panel border border-cyan-500/30 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-cyan-500/10 border-b border-cyan-500/20">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  AI Prediction
                </h4>
              </div>
              <div className="p-4 bg-black/30 max-h-48 overflow-y-auto custom-scrollbar">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {narrative}
                </p>
              </div>
            </div>
          )}

          {/* Reset Button */}
          {(params.car !== 0 || params.transit !== 0 || params.trees !== 0) && (
            <button
              onClick={() => onParamsChange({ car: 0, trees: 0, transit: 0 })}
              className="w-full py-2 px-4 text-sm text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors border border-gray-700 hover:border-cyan-500/50"
            >
              Reset to Current
            </button>
          )}
        </div>
      )}

      {/* Resize Handle */}
      {isExpanded && (
        <div
          ref={resizeHandleRef}
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize group"
          onMouseDown={handleResizeMouseDown}
        >
          <div className="absolute bottom-1 right-1 w-4 h-4 border-r-2 border-b-2 border-cyan-500/30 group-hover:border-cyan-500/70 transition-colors rounded-br-lg"></div>
          <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r border-b border-cyan-500/50 group-hover:border-cyan-500/90 transition-colors"></div>
        </div>
      )}
    </div>
  );
}
