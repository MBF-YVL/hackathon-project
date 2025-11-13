/**
 * Header component
 * Displays project title and year indicator
 */
"use client";

import React from "react";

interface HeaderProps {
  scenario: "current" | "2035";
}

export default function Header({ scenario }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-b border-slate-700 shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              CityPulse Montréal
            </h1>
            <p className="text-sm text-slate-300">Urban Stress Digital Twin</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase tracking-wider">
                Scenario Year
              </div>
              <div className="text-3xl font-bold text-cyan-400">
                {scenario === "current" ? "2025" : "2035"}
              </div>
            </div>

            <div className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div className="text-xs text-cyan-300 font-semibold">
                Build the World of Tomorrow
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
