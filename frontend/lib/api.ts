/**
 * API client for CityPulse backend
 */
import { GeoJSONFeatureCollection, Hotspot, CellDetails, ScenarioParams } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export class CityPulseAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch grid data with optional scenario parameters
   */
  async getGrid(scenario: 'current' | '2035' = 'current', params?: ScenarioParams): Promise<GeoJSONFeatureCollection> {
    const url = new URL(`${this.baseUrl}/api/grid`);
    url.searchParams.append('scenario', scenario);
    
    if (params) {
      if (params.car !== 0) url.searchParams.append('car', params.car.toString());
      if (params.trees !== 0) url.searchParams.append('trees', params.trees.toString());
      if (params.transit !== 0) url.searchParams.append('transit', params.transit.toString());
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch grid: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch hotspots
   */
  async getHotspots(): Promise<Hotspot[]> {
    const response = await fetch(`${this.baseUrl}/api/hotspots`);
    if (!response.ok) {
      throw new Error(`Failed to fetch hotspots: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch cell details
   */
  async getCell(cellId: string): Promise<CellDetails> {
    const response = await fetch(`${this.baseUrl}/api/cell/${cellId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch cell: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch tree locations
   */
  async getTrees(): Promise<GeoJSONFeatureCollection> {
    const response = await fetch(`${this.baseUrl}/api/trees`);
    if (!response.ok) {
      throw new Error(`Failed to fetch trees: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch planting sites
   */
  async getPlantingSites(): Promise<GeoJSONFeatureCollection> {
    const response = await fetch(`${this.baseUrl}/api/planting-sites`);
    if (!response.ok) {
      throw new Error(`Failed to fetch planting sites: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Generate scenario narrative
   */
  async getScenarioSummary(params: ScenarioParams, metrics: any): Promise<{ narrative: string }> {
    const response = await fetch(`${this.baseUrl}/api/scenario/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        car: params.car,
        trees: params.trees,
        transit: params.transit,
        aggregate_metrics: metrics,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate scenario summary: ${response.statusText}`);
    }
    return response.json();
  }
}

// Export singleton instance
export const api = new CityPulseAPI();

