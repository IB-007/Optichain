import pandas as pd
import numpy as np
from supabase import create_client, Client

# --- CONFIGURATION ---
URL = "https://kchzoncfejqsaslppbwk.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjaHpvbmNmZWpxc2FzbHBwYndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMzA3NjMsImV4cCI6MjA4MTYwNjc2M30.puPa0NNIAHQfkORQjthWFBzYr16SgpBaho8kdmfErvw"

supabase: Client = create_client(URL, KEY)

def run_esr_model():
    print("Fetching data from inventory_params...")
    try:
        # 1. Pull data
        response = supabase.table("inventory_params").select("*").execute()
        df = pd.DataFrame(response.data)
        
        if df.empty:
            print("No data found in table.")
            return

        # 2. ESR LOGIC (Supply Chain Probability)
        # We calculate the probability of "High Sell-Through" 
        # based on Avg Demand vs Lead Time.
        def predict_probability(row):
            avg_demand = float(row.get('avg_daily_demand', 0))
            std_dev = float(row.get('std_dev_demand', 0))
            lead_time = float(row.get('lead_time_days', 0))
            
            # Logic: Higher avg demand + lower lead time = Higher sell-through prob
            # This is a simplified logistical curve for supply chain risk
            z_score = (avg_demand * 0.1) - (lead_time * 0.05) + (std_dev * 0.02)
            prob = 1 / (1 + np.exp(-z_score))
            return round(float(prob), 4)

        print("Analyzing demand patterns...")
        df['sell_through_prob'] = df.apply(predict_probability, axis=1)

        # 3. PUSH UPDATES BACK
        print(f"Syncing {len(df)} predictions to Supabase...")
        for _, row in df.iterrows():
            # Using sku_id and location_id as the unique identifier
            supabase.table("inventory_params") \
                .update({"sell_through_prob": row['sell_through_prob']}) \
                .eq("sku_id", row['sku_id']) \
                .eq("location_id", row['location_id']) \
                .execute()

        print("✅ ESR Model Update Complete.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    run_esr_model()