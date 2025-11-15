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
    <div className="absolute top-20 right-6 z-10 glass-panel rounded-2xl shadow-2xl border border-cyan-500/30 w-96 max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="px-5 py-4 bg-cyan-500/10 text-cyan-400 border-b border-cyan-500/20 rounded-t-2xl flex items-center justify-between sticky top-0 backdrop-blur-md">
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider">Cell Details</h3>
          <p className="text-xs text-cyan-300/60 mt-1">{cell.id}</p>
        </div>
        <button
          onClick={onClose}
          className="text-cyan-400 hover:text-cyan-300 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cyan-500/20 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* CSI Score */}
        <div className="glass-panel p-6 rounded-xl border border-cyan-500/30">
          <div className="text-center">
            <div className="text-xs text-cyan-400/70 uppercase tracking-wider mb-2">
              City Stress Index
            </div>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
              {Math.round(metrics.csi_current)}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              out of 100
            </div>
            {metrics.csi_scenario !== metrics.csi_current && (
              <div className="mt-3 text-sm">
                <span className="text-cyan-400 font-semibold">
                  → {Math.round(metrics.csi_scenario)} in 2035
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stress Components */}
        <div>
          <h4 className="text-xs font-bold text-cyan-400 mb-3 uppercase tracking-wider">
            Stress Components
          </h4>
          <div className="space-y-3">
            <StressBar label="Air Quality" value={metrics.air_stress} color="from-yellow-500 to-yellow-400" />
            <StressBar label="Heat" value={metrics.heat_stress} color="from-orange-500 to-orange-400" />
            <StressBar label="Noise" value={metrics.noise_stress} color="from-blue-500 to-blue-400" />
            <StressBar label="Traffic" value={metrics.traffic_stress} color="from-red-500 to-red-400" />
            <StressBar label="Transit Crowding" value={metrics.crowding_stress} color="from-cyan-500 to-cyan-400" />
          </div>
        </div>

        {/* Vulnerability */}
        <div className="glass-panel p-4 border border-cyan-500/30 rounded-xl">
          <div className="text-xs text-cyan-400 font-bold mb-2 uppercase tracking-wider">
            Vulnerability Factor
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-black/50 rounded-full h-3 border border-cyan-500/20">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-3 rounded-full shadow-lg shadow-amber-500/50"
                style={{ width: `${metrics.vulnerability_factor * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-cyan-400">
              {(metrics.vulnerability_factor * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* AI Summary */}
        {cell.summary && (
          <div className="glass-panel p-4 border border-cyan-500/30 rounded-xl">
            <div className="text-xs text-cyan-400 font-bold mb-2 uppercase tracking-wider">
              AI Analysis
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {cell.summary.short}
            </p>
          </div>
        )}

        {/* Interventions */}
        <div>
          <h4 className="text-xs font-bold text-cyan-400 mb-3 uppercase tracking-wider">
            Recommended Interventions
          </h4>
          <div className="space-y-3">
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
      <div className="flex justify-between text-xs text-gray-300 mb-2">
        <span className="font-medium">{label}</span>
        <span className="font-bold text-cyan-400">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="w-full bg-black/50 rounded-full h-2.5 border border-cyan-500/20">
        <div
          className={`bg-gradient-to-r ${color} h-2.5 rounded-full transition-all shadow-lg`}
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
    <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
        <div className="flex-1">
        <div className="font-bold text-sm text-cyan-400 mb-1">{title}</div>
        <div className="text-xs text-gray-400 mb-2">{detail}</div>
          {impact < 0 && (
          <div className="text-xs text-cyan-400 font-semibold mb-3 flex items-center gap-1">
              <span>Expected CSI reduction:</span>
              <span className="text-cyan-300">{Math.abs(Math.round(impact))} points</span>
            </div>
          )}
          <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-gray-400">Priority:</span>
          <div className="flex-1 bg-black/50 rounded-full h-2 border border-cyan-500/20">
              <div
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full shadow-lg shadow-cyan-500/50"
                style={{ width: `${score * 100}%` }}
              ></div>
            </div>
          <span className="text-xs font-bold text-cyan-400">
              {(score * 100).toFixed(0)}%
            </span>
        </div>
      </div>
    </div>
  );
}

