export interface SKU {
  id: string;
  name: string;
  category: string; // Inferred from name/type
  cost: number;
  price: number;
}

export interface Store {
  id: string;
  name: string;
  region: string;
  capacity: number;
}

export interface ForecastPoint {
  date: string;
  actual?: number;
  forecast?: number;
  lowerBound?: number;
  upperBound?: number;
}

export interface SimulationParams {
  demandSurge: number; // Percentage -50 to +50
  leadTimeShock: number; // Days 0 to 30
  supplierReliability: number; // 0.0 to 1.0
}

export interface SimulationResult {
  scenarioName: string;
  stockoutRate: number;
  fillRate: number;
  totalCost: number;
  revenue: number;
  dailyInventory: { day: number; inventory: number }[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  FORECASTING = 'FORECASTING',
  ALLOCATION = 'ALLOCATION',
  SIMULATION = 'SIMULATION',
}

export interface AllocationRow {
  storeId: string;
  storeName: string;
  currentStock: number;
  forecastDemand: number;
  suggestedAllocation: number; // This maps to safety_stock_recommendation
  finalAllocation: number;
  sellThroughProb: number;
  leadTime: number;
}