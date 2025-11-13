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

            <div className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
              <div className="text-xs text-cyan-300 font-semibold">
                🏗️ Build the World of Tomorrow
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
