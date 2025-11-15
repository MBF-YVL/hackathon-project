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
    <header className="absolute top-0 left-0 right-0 z-10 glass-panel border-b border-cyan-500/20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
              CityPulse Montréal
            </h1>
            <p className="text-xs text-cyan-300/70">Urban Stress Digital Twin</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right glass-panel px-4 py-2 rounded-lg border border-cyan-500/30">
              <div className="text-[10px] text-cyan-400/60 uppercase tracking-wider">
                Scenario Year
              </div>
              <div className="text-3xl font-bold text-cyan-400">
                {scenario === "current" ? "2025" : "2035"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
