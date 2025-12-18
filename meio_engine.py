import os
import numpy as np
from scipy.stats import norm
from supabase import create_client
from dotenv import load_dotenv

# 1. Load Secrets
load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("❌ Missing API Keys. Check your .env file.")

supabase = create_client(url, key)


def run_optimization():
    print("⚙️ Running MEIO Optimization Engine...")

    # 2. Fetch Input Data
    # We need to grab the parameters we just seeded (Demand, Lead Time, etc.)
    try:
        response = supabase.table('inventory_params').select("*").execute()
        data = response.data
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return

    if not data:
        print("⚠️ No data found in 'inventory_params'. Did you run data_seeder.py?")
        return

    results = []

    print(f"📊 Processing {len(data)} SKU-Locations...")

    for row in data:
        # 3. THE MATH (Standard Safety Stock Calculation)
        # Formula: Safety Stock = Z * sqrt(Lead Time) * StdDev_Demand

        # A. Get Z-Score (The buffer confidence)
        # 95% service level = 1.64 sigma
        target_service_level = float(row['service_level_target'])
        z_score = norm.ppf(target_service_level)

        # B. Calculate Variability
        # This measures how much "risk" exists during the wait for new stock
        lead_time = float(row['lead_time_days'])
        std_dev = float(row['std_dev_demand'])

        # Variability during lead time = sqrt(LeadTime) * Daily_Volatility
        lead_time_demand_std_dev = np.sqrt(lead_time) * std_dev

        # C. Final Safety Stock
        safety_stock = int(np.ceil(z_score * lead_time_demand_std_dev))

        # 4. Prepare Result Row
        results.append({
            "sku_id": row['sku_id'],
            "location_id": row['location_id'],
            "safety_stock_recommendation": safety_stock,
            "narrative_status": "pending"  # This triggers the AI later
        })

    # 5. Push Results to Supabase
    if results:
        try:
            # We use upsert to overwrite if we run this multiple times
            supabase.table('meio_results').upsert(results).execute()
            print(f"🚀 Success! Uploaded {len(results)} optimization results to Supabase.")
        except Exception as e:
            print(f"❌ Error uploading results: {e}")
    else:
        print("⚠️ No results to upload.")


if __name__ == "__main__":
    run_optimization()