/**
 * Type definitions for CityPulse Montréal 2035
 */

export interface CellProperties {
  id: string;
  csi_current: number;
  csi_scenario: number;
  air_stress: number;
  heat_stress: number;
  noise_stress: number;
  traffic_stress: number;
  crowding_stress: number;
  vulnerability_factor: number;
  is_hotspot?: boolean;
  tree_score?: number;
  car_limit_score?: number;
  transit_score?: number;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: CellProperties;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface Hotspot {
  id: string;
  centroid: {
    lat: number;
    lng: number;
  };
  avg_csi: number;
  top_drivers: string[];
  avg_vulnerability: number;
  cell_ids: string[];
}

export interface Intervention {
  score: number;
  recommended_count?: number;
  type?: string;
  expected_delta_csi: number;
}

export interface CellDetails {
  id: string;
  metrics: {
    csi_current: number;
    csi_scenario: number;
    air_stress: number;
    heat_stress: number;
    noise_stress: number;
    traffic_stress: number;
    crowding_stress: number;
    vulnerability_factor: number;
  };
  interventions: {
    trees: Intervention;
    car_limits: Intervention;
    transit: Intervention;
  };
  summary: {
    short: string;
    source: string;
  };
}

export interface ScenarioParams {
  car: number;
  trees: number;
  transit: number;
}

export interface LayerVisibility {
  csi: boolean;
  trees: boolean;
  planting: boolean;
  hotspots: boolean;
}

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

