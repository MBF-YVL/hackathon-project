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
    <header className="absolute top-0 left-0 right-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              CityPulse Montréal
            </h1>
            <p className="text-xs text-slate-400">Urban Stress Digital Twin</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                Year
              </div>
              <div className="text-2xl font-bold text-cyan-400">
                {scenario === "current" ? "2025" : "2035"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
