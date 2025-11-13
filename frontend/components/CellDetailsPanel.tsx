/**
 * Cell Details Panel component
 * Displays detailed information for selected cell
 */
'use client';

import React from 'react';
import { CellDetails } from '@/types';

interface CellDetailsPanelProps {
  cell: CellDetails | null;
  onClose: () => void;
}

export default function CellDetailsPanel({ cell, onClose }: CellDetailsPanelProps) {
  if (!cell) return null;

  const metrics = cell.metrics;
  const interventions = cell.interventions;

  return (
    <div className="absolute top-20 right-6 z-10 bg-slate-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700 w-96 max-h-[calc(100vh-7rem)] overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800 text-white border-b border-slate-700 rounded-t-lg flex items-center justify-between sticky top-0">
        <div>
          <h3 className="font-semibold text-sm">Cell Details</h3>
          <p className="text-[10px] text-slate-400">{cell.id}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-xl font-bold w-7 h-7 flex items-center justify-center rounded hover:bg-white/10"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* CSI Score */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
          <div className="text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
              City Stress Index
            </div>
            <div className="text-4xl font-bold text-white">
              {Math.round(metrics.csi_current)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              out of 100
            </div>
            {metrics.csi_scenario !== metrics.csi_current && (
              <div className="mt-2 text-sm">
                <span className="text-cyan-400 font-semibold">
                  → {Math.round(metrics.csi_scenario)} in 2035
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stress Components */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Stress Components
          </h4>
          <div className="space-y-2">
            <StressBar label="Air Quality" value={metrics.air_stress} color="bg-yellow-500" />
            <StressBar label="Heat" value={metrics.heat_stress} color="bg-orange-500" />
            <StressBar label="Noise" value={metrics.noise_stress} color="bg-blue-500" />
            <StressBar label="Traffic" value={metrics.traffic_stress} color="bg-red-500" />
            <StressBar label="Transit Crowding" value={metrics.crowding_stress} color="bg-cyan-500" />
          </div>
        </div>

        {/* Vulnerability */}
        <div className="p-3 bg-slate-800/50 border border-slate-600 rounded-lg">
          <div className="text-xs text-slate-300 font-semibold mb-1">
            Vulnerability Factor
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-700 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{ width: `${metrics.vulnerability_factor * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-white">
              {(metrics.vulnerability_factor * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* AI Summary */}
        {cell.summary && (
          <div className="p-3 bg-slate-800/50 border border-slate-600 rounded-lg">
            <div className="text-xs text-slate-300 font-semibold mb-2 uppercase tracking-wider">
              groq
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {cell.summary.short}
            </p>
          </div>
        )}

        {/* Interventions */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Recommended Interventions
          </h4>
          <div className="space-y-2">
            <InterventionCard
              title="Tree Planting"
              score={interventions.trees.score}
              detail={`${interventions.trees.recommended_count} trees recommended`}
              impact={interventions.trees.expected_delta_csi}
            />
            <InterventionCard
              title="Car Access Limits"
              score={interventions.car_limits.score}
              detail={interventions.car_limits.type?.replace('_', ' ') || 'No intervention'}
              impact={interventions.car_limits.expected_delta_csi}
            />
            <InterventionCard
              title="Transit Improvements"
              score={interventions.transit.score}
              detail={interventions.transit.type?.replace('_', ' ') || 'No intervention'}
              impact={interventions.transit.expected_delta_csi}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-300 mb-1">
        <span>{label}</span>
        <span className="font-semibold text-white">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${value * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

function InterventionCard({
  title,
  score,
  detail,
  impact,
}: {
  title: string;
  score: number;
  detail: string;
  impact: number;
}) {
  return (
    <div className="p-3 rounded-lg border border-slate-600 bg-slate-800/30">
        <div className="flex-1">
        <div className="font-semibold text-sm text-white">{title}</div>
        <div className="text-xs text-slate-300 mt-0.5">{detail}</div>
          {impact < 0 && (
          <div className="text-xs text-emerald-400 font-semibold mt-1">
              Expected CSI reduction: {Math.abs(Math.round(impact))} points
            </div>
          )}
          <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Priority:</span>
          <div className="flex-1 bg-slate-700 rounded-full h-1.5">
              <div
              className="bg-slate-400 h-1.5 rounded-full"
                style={{ width: `${score * 100}%` }}
              ></div>
            </div>
          <span className="text-xs font-semibold text-white">
              {(score * 100).toFixed(0)}%
            </span>
        </div>
      </div>
    </div>
  );
}

