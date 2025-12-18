import { ForecastPoint, SKU, Store, AllocationRow, SimulationResult, SimulationParams } from '../types';

// --- DATA FROM CSV ---

const RAW_SKUS = [
  { id: 'ADIDAS-UB-002', name: 'Adidas Ultraboost', cost_price: 12000.0, category: 'Footwear' },
  { id: 'AMUL-BUTTER', name: 'Amul Butter 500g', cost_price: 270.0, category: 'Food' },
  { id: 'BRIT-BREAD', name: 'Britannia Wheat Bread', cost_price: 45.0, category: 'Food' },
  { id: 'LAYS-CLASSIC', name: 'Lays Classic Chips', cost_price: 20.0, category: 'Food' },
  { id: 'LEVIS-JEANS', name: 'Levis 511 Jeans', cost_price: 3500.0, category: 'Apparel' },
  { id: 'NIKE-AIR-001', name: 'Nike Air Max 90', cost_price: 8500.0, category: 'Footwear' },
  { id: 'ZARA-SHIRT', name: 'Zara Cotton Shirt', cost_price: 2500.0, category: 'Apparel' },
];

const RAW_LOCATIONS = [
  { id: '120634dc-d595-4c3b-91d8-15b142265598', name: 'Store - Koramangala', type: 'store' },
  { id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', name: 'Store - Indiranagar', type: 'store' },
  { id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', name: 'Store - Whitefield', type: 'store' },
];

// sku_id, location_id, avg_daily_demand, std_dev_demand, lead_time_days, sell_through_prob
const DEMAND_METRICS = [
  { sku_id: 'ADIDAS-UB-002', location_id: '120634dc-d595-4c3b-91d8-15b142265598', avg: 7.06, std: 1.04, lead: 10, prob: 0.5565 },
  { sku_id: 'ADIDAS-UB-002', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', avg: 6.64, std: 1.38, lead: 10, prob: 0.5478 },
  { sku_id: 'ADIDAS-UB-002', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', avg: 4.22, std: 1.76, lead: 7, prob: 0.5268 },
  { sku_id: 'AMUL-BUTTER', location_id: '120634dc-d595-4c3b-91d8-15b142265598', avg: 64.01, std: 18.18, lead: 2, prob: 0.9987 },
  { sku_id: 'AMUL-BUTTER', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', avg: 65.23, std: 17.07, lead: 1, prob: 0.9989 },
  { sku_id: 'AMUL-BUTTER', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', avg: 130.52, std: 21.46, lead: 2, prob: 1.0 },
  { sku_id: 'BRIT-BREAD', location_id: '120634dc-d595-4c3b-91d8-15b142265598', avg: 113.33, std: 23.53, lead: 2, prob: 1.0 },
  { sku_id: 'BRIT-BREAD', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', avg: 111.11, std: 27.58, lead: 1, prob: 1.0 },
  { sku_id: 'BRIT-BREAD', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', avg: 72.98, std: 20.46, lead: 1, prob: 0.9995 },
  { sku_id: 'LAYS-CLASSIC', location_id: '120634dc-d595-4c3b-91d8-15b142265598', avg: 74.83, std: 12.75, lead: 2, prob: 0.9995 },
  { sku_id: 'LAYS-CLASSIC', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', avg: 106.22, std: 19.31, lead: 1, prob: 1.0 },
  { sku_id: 'LAYS-CLASSIC', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', avg: 117.6, std: 27.64, lead: 1, prob: 1.0 },
  { sku_id: 'LEVIS-JEANS', location_id: '120634dc-d595-4c3b-91d8-15b142265598', avg: 23.69, std: 2.03, lead: 4, prob: 0.9011 },
  { sku_id: 'LEVIS-JEANS', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', avg: 14.02, std: 4.93, lead: 5, prob: 0.7774 },
  { sku_id: 'LEVIS-JEANS', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', avg: 23.79, std: 7.87, lead: 3, prob: 0.9158 },
  { sku_id: 'NIKE-AIR-001', location_id: '120634dc-d595-4c3b-91d8-15b142265598', avg: 4.53, std: 1.24, lead: 6, prob: 0.5443 },
  { sku_id: 'NIKE-AIR-001', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', avg: 5.17, std: 1.68, lead: 9, prob: 0.5251 },
  { sku_id: 'NIKE-AIR-001', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', avg: 6.39, std: 1.25, lead: 6, prob: 0.59 },
  { sku_id: 'ZARA-SHIRT', location_id: '120634dc-d595-4c3b-91d8-15b142265598', avg: 11.82, std: 3.58, lead: 5, prob: 0.7318 },
  { sku_id: 'ZARA-SHIRT', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', avg: 25.86, std: 4.53, lead: 3, prob: 0.926 },
  { sku_id: 'ZARA-SHIRT', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', avg: 25.13, std: 2.55, lead: 5, prob: 0.91 },
];

const RECOMMENDATIONS = [
  { sku_id: 'BRIT-BREAD', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 34 },
  { sku_id: 'AMUL-BUTTER', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 50 },
  { sku_id: 'ZARA-SHIRT', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', safety_stock: 13 },
  { sku_id: 'ADIDAS-UB-002', location_id: '120634dc-d595-4c3b-91d8-15b142265598', safety_stock: 6 },
  { sku_id: 'LAYS-CLASSIC', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 46 },
  { sku_id: 'BRIT-BREAD', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', safety_stock: 46 },
  { sku_id: 'LEVIS-JEANS', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 23 },
  { sku_id: 'ADIDAS-UB-002', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', safety_stock: 8 },
  { sku_id: 'ZARA-SHIRT', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', safety_stock: 13 },
  { sku_id: 'ZARA-SHIRT', location_id: '120634dc-d595-4c3b-91d8-15b142265598', safety_stock: 14 },
  { sku_id: 'NIKE-AIR-001', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 6 },
  { sku_id: 'ADIDAS-UB-002', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 8 },
  { sku_id: 'BRIT-BREAD', location_id: '120634dc-d595-4c3b-91d8-15b142265598', safety_stock: 55 },
  { sku_id: 'ADIDAS-UB-002', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', safety_stock: 8 },
  { sku_id: 'NIKE-AIR-001', location_id: '120634dc-d595-4c3b-91d8-15b142265598', safety_stock: 5 },
  { sku_id: 'AMUL-BUTTER', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', safety_stock: 29 },
  { sku_id: 'LAYS-CLASSIC', location_id: '120634dc-d595-4c3b-91d8-15b142265598', safety_stock: 30 },
  { sku_id: 'LAYS-CLASSIC', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', safety_stock: 32 },
  { sku_id: 'NIKE-AIR-001', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 6 },
  { sku_id: 'NIKE-AIR-001', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', safety_stock: 9 },
  { sku_id: 'LAYS-CLASSIC', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 46 },
  { sku_id: 'LEVIS-JEANS', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', safety_stock: 19 },
  { sku_id: 'AMUL-BUTTER', location_id: '120634dc-d595-4c3b-91d8-15b142265598', safety_stock: 43 },
  { sku_id: 'LAYS-CLASSIC', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', safety_stock: 32 },
  { sku_id: 'ADIDAS-UB-002', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 8 },
  { sku_id: 'LEVIS-JEANS', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 23 },
  { sku_id: 'LEVIS-JEANS', location_id: '120634dc-d595-4c3b-91d8-15b142265598', safety_stock: 7 },
  { sku_id: 'NIKE-AIR-001', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', safety_stock: 9 },
  { sku_id: 'BRIT-BREAD', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', safety_stock: 46 },
  { sku_id: 'BRIT-BREAD', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 34 },
  { sku_id: 'ZARA-SHIRT', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 10 },
  { sku_id: 'LAYS-CLASSIC', location_id: '120634dc-d595-4c3b-91d8-15b142265598', safety_stock: 30 },
  { sku_id: 'LEVIS-JEANS', location_id: 'b3fe9e88-b47a-4cb3-bcb3-a22e3c97e033', safety_stock: 19 },
  { sku_id: 'AMUL-BUTTER', location_id: '120634dc-d595-4c3b-91d8-15b142265598', safety_stock: 43 },
  { sku_id: 'ZARA-SHIRT', location_id: '120634dc-d595-4c3b-91d8-15b142265598', safety_stock: 14 },
  { sku_id: 'AMUL-BUTTER', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 50 },
  { sku_id: 'LEVIS-JEANS', location_id: '120634dc-d595-4c3b-91d8-15b142265598', safety_stock: 7 },
  { sku_id: 'BRIT-BREAD', location_id: '120634dc-d595-4c3b-91d8-15b142265598', safety_stock: 55 },
  { sku_id: 'ADIDAS-UB-002', location_id: '120634dc-d595-4c3b-91d8-15b142265598', safety_stock: 6 },
  { sku_id: 'ZARA-SHIRT', location_id: 'cf39a445-b0d4-40fd-9c47-3470e1458baa', safety_stock: 10 },
];

// --- ADAPTERS ---

export const SKUS: SKU[] = RAW_SKUS.map(s => ({
  id: s.id,
  name: s.name,
  category: s.category,
  cost: s.cost_price * 0.6, // Estimate cost as 60% of price for demo
  price: s.cost_price,
  // These will be dynamic now
  currentStock: 0,
  safetyStock: 0,
  leadTimeDays: 0
}));

export const STORES: Store[] = RAW_LOCATIONS.map(l => ({
  id: l.id,
  name: l.name,
  region: 'Bangalore',
  capacity: 1000 // Placeholder
}));

// --- HELPERS ---

const getSkuLocationMetrics = (skuId: string, storeId: string) => {
  return DEMAND_METRICS.find(d => d.sku_id === skuId && d.location_id === storeId) || { avg: 10, std: 2, lead: 3, prob: 0.5 };
};

const getRecommendation = (skuId: string, storeId: string) => {
  const rec = RECOMMENDATIONS.find(r => r.sku_id === skuId && r.location_id === storeId);
  return rec ? rec.safety_stock : 10;
};

// Generate forecast using specific mean/std from CSV
export const generateForecastData = (skuId: string): ForecastPoint[] => {
  const points: ForecastPoint[] = [];
  const today = new Date();
  
  // Aggregate demand across all stores for this SKU to show a global forecast
  // or just pick the first store's metrics for simplicity of the chart
  const storeMetrics = DEMAND_METRICS.filter(d => d.sku_id === skuId);
  const totalAvgDemand = storeMetrics.reduce((sum, m) => sum + m.avg, 0) || 50;
  const totalStdDev = Math.sqrt(storeMetrics.reduce((sum, m) => sum + (m.std * m.std), 0)) || 10;

  // 30 days history
  for (let i = 30; i > 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const noise = (Math.random() - 0.5) * (totalStdDev * 2);
    // Add a slight trend
    const trend = Math.sin(i / 10) * (totalAvgDemand * 0.1); 
    
    points.push({
      date: d.toISOString().split('T')[0],
      actual: Math.max(0, Math.round(totalAvgDemand + trend + noise)),
    });
  }

  // 14 days forecast
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const trend = Math.sin((30 + i) / 10) * (totalAvgDemand * 0.1);
    const forecast = Math.max(0, Math.round(totalAvgDemand + trend));
    const uncertainty = totalStdDev * (1 + (i * 0.1)); // Uncertainty grows
    
    points.push({
      date: d.toISOString().split('T')[0],
      forecast: forecast,
      lowerBound: Math.max(0, Math.round(forecast - uncertainty)),
      upperBound: Math.round(forecast + uncertainty),
    });
  }
  return points;
};

export const generateAllocationPlan = (sku: SKU): AllocationRow[] => {
  return STORES.map((store) => {
    const metrics = getSkuLocationMetrics(sku.id, store.id);
    const safetyStockRec = getRecommendation(sku.id, store.id);
    
    // Simulate current stock. 
    // If we have a safety stock rec, usually current stock is below it if we are allocating.
    // Let's randomize it slightly below the recommendation to trigger an allocation need.
    const simulatedCurrentStock = Math.max(0, Math.round(safetyStockRec * (0.5 + Math.random() * 0.8)));
    
    // Forecast demand over lead time
    const demandOverLeadTime = Math.round(metrics.avg * metrics.lead);

    return {
      storeId: store.id,
      storeName: store.name,
      currentStock: simulatedCurrentStock,
      forecastDemand: demandOverLeadTime,
      sellThroughProb: metrics.prob,
      suggestedAllocation: safetyStockRec,
      finalAllocation: safetyStockRec,
      leadTime: metrics.lead
    };
  });
};

export const runSimulation = (params: SimulationParams): SimulationResult => {
  // Mock simulation logic
  const days = 30;
  const history: { day: number; inventory: number }[] = [];
  let currentInv = 1000;
  let stockouts = 0;
  let totalSales = 0;
  
  for (let i = 1; i <= days; i++) {
    // Demand affected by surge
    let dailyDemand = 30 * (1 + params.demandSurge / 100);
    dailyDemand = dailyDemand * (0.8 + Math.random() * 0.4); // Variance

    // Supply arrival logic (simplified)
    if (i % 7 === 0) {
        // Weekly replenishment affected by lead time shock reliability
        const received = Math.random() < params.supplierReliability ? 200 : 0;
        currentInv += received;
    }

    if (currentInv >= dailyDemand) {
        currentInv -= dailyDemand;
        totalSales += dailyDemand;
    } else {
        totalSales += currentInv;
        currentInv = 0;
        stockouts++;
    }
    
    history.push({ day: i, inventory: Math.round(currentInv) });
  }

  const stockoutRate = stockouts / days;
  const fillRate = 1 - stockoutRate;
  const cost = stockouts * 100 + (1000 - currentInv) * 10; // Penalty cost mock

  return {
    scenarioName: `Scenario: Surge ${params.demandSurge}%, Shock ${params.leadTimeShock}d`,
    stockoutRate: parseFloat(stockoutRate.toFixed(2)),
    fillRate: parseFloat(fillRate.toFixed(2)),
    totalCost: Math.round(cost),
    revenue: Math.round(totalSales * 50),
    dailyInventory: history,
  };
};