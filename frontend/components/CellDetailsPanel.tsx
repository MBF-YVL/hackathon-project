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
    <div className="absolute top-24 right-6 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-200 w-96 max-h-[calc(100vh-8rem)] overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-t-lg flex items-center justify-between sticky top-0">
        <div>
          <h3 className="font-semibold">Cell Details</h3>
          <p className="text-xs text-slate-200">{cell.id}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* CSI Score */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
          <div className="text-center">
            <div className="text-xs text-slate-600 uppercase tracking-wider mb-1">
              City Stress Index
            </div>
            <div className="text-4xl font-bold text-slate-900">
              {Math.round(metrics.csi_current)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              out of 100
            </div>
            {metrics.csi_scenario !== metrics.csi_current && (
              <div className="mt-2 text-sm">
                <span className="text-cyan-600 font-semibold">
                  → {Math.round(metrics.csi_scenario)} in 2035
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stress Components */}
        <div>
          <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
            Stress Components
          </h4>
          <div className="space-y-2">
            <StressBar label="Air Quality" value={metrics.air_stress} color="bg-yellow-500" />
            <StressBar label="Heat" value={metrics.heat_stress} color="bg-orange-500" />
            <StressBar label="Noise" value={metrics.noise_stress} color="bg-purple-500" />
            <StressBar label="Traffic" value={metrics.traffic_stress} color="bg-red-500" />
            <StressBar label="Transit Crowding" value={metrics.crowding_stress} color="bg-blue-500" />
          </div>
        </div>

        {/* Vulnerability */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-xs text-amber-900 font-semibold mb-1">
            Vulnerability Factor
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-amber-200 rounded-full h-2">
              <div
                className="bg-amber-600 h-2 rounded-full"
                style={{ width: `${metrics.vulnerability_factor * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-amber-900">
              {(metrics.vulnerability_factor * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* AI Summary */}
        {cell.summary && (
          <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
            <div className="text-xs text-cyan-900 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>AI Analysis</span>
              <span className="text-[10px] bg-cyan-200 px-1.5 py-0.5 rounded uppercase">
                {cell.summary.source}
              </span>
            </div>
            <p className="text-sm text-cyan-900 leading-relaxed">
              {cell.summary.short}
            </p>
          </div>
        )}

        {/* Interventions */}
        <div>
          <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
            Recommended Interventions
          </h4>
          <div className="space-y-2">
            <InterventionCard
              type="tree"
              title="Tree Planting"
              score={interventions.trees.score}
              detail={`${interventions.trees.recommended_count} trees recommended`}
              impact={interventions.trees.expected_delta_csi}
            />
            <InterventionCard
              type="car"
              title="Car Access Limits"
              score={interventions.car_limits.score}
              detail={interventions.car_limits.type?.replace('_', ' ') || 'No intervention'}
              impact={interventions.car_limits.expected_delta_csi}
            />
            <InterventionCard
              type="transit"
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
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${value * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

function InterventionCard({
  type,
  title,
  score,
  detail,
  impact,
}: {
  type: 'tree' | 'car' | 'transit';
  title: string;
  score: number;
  detail: string;
  impact: number;
}) {
  const priorityColor =
    score > 0.7 ? 'bg-red-50 border-red-200' :
    score > 0.5 ? 'bg-yellow-50 border-yellow-200' :
    'bg-slate-50 border-slate-200';

  const iconColor =
    type === 'tree' ? 'text-green-600' :
    type === 'car' ? 'text-red-600' :
    'text-blue-600';

  const getIcon = () => {
    if (type === 'tree') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    } else if (type === 'car') {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${priorityColor} transition-all hover:shadow-md cursor-pointer`}>
      <div className="flex items-start gap-3">
        <div className={iconColor}>{getIcon()}</div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-slate-900">{title}</div>
          <div className="text-xs text-slate-600 mt-0.5">{detail}</div>
          {impact < 0 && (
            <div className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              CSI reduction: {Math.abs(Math.round(impact))} points
            </div>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">Priority</span>
            <div className="flex-1 bg-slate-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  score > 0.7 ? 'bg-red-500' : score > 0.5 ? 'bg-yellow-500' : 'bg-slate-400'
                }`}
                style={{ width: `${score * 100}%` }}
              ></div>
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {(score * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

