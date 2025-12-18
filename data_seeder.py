import os
import random
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


def seed_database():
    print("🌱 Seeding Bangalore Supply Chain Data...")

    # 1. Create Locations (Bangalore Context)
    # Central Warehouse in an industrial area
    dc_data = {"name": "Central DC - Peenya Industrial Area", "type": "central_dc"}
    dc_res = supabase.table('locations').insert(dc_data).execute()
    dc_id = dc_res.data[0]['id']

    # 3 Retail Stores in popular Bangalore neighborhoods
    stores = [
        {"name": "Store - Indiranagar", "type": "store", "parent_location_id": dc_id},
        {"name": "Store - Koramangala", "type": "store", "parent_location_id": dc_id},
        {"name": "Store - Whitefield", "type": "store", "parent_location_id": dc_id}
    ]
    store_res = supabase.table('locations').insert(stores).execute()
    store_ids = [s['id'] for s in store_res.data]

    # 2. Create Mixed Products (Footwear, Food, Clothing)
    products = [
        # Footwear (High Value, Low Velocity)
        {"id": "NIKE-AIR-001", "name": "Nike Air Max 90", "cost_price": 8500.00, "category": "footwear"},
        {"id": "ADIDAS-UB-002", "name": "Adidas Ultraboost", "cost_price": 12000.00, "category": "footwear"},

        # Food / FMCG (Low Value, High Velocity)
        {"id": "BRIT-BREAD", "name": "Britannia Wheat Bread", "cost_price": 45.00, "category": "food"},
        {"id": "AMUL-BUTTER", "name": "Amul Butter 500g", "cost_price": 270.00, "category": "food"},
        {"id": "LAYS-CLASSIC", "name": "Lays Classic Chips", "cost_price": 20.00, "category": "food"},

        # Clothing (Medium Value, Medium Velocity)
        {"id": "ZARA-SHIRT", "name": "Zara Cotton Shirt", "cost_price": 2500.00, "category": "clothing"},
        {"id": "LEVIS-JEANS", "name": "Levis 511 Jeans", "cost_price": 3500.00, "category": "clothing"}
    ]

    # We need to filter out the 'category' key before inserting into SKUs table
    # because your Supabase 'skus' table might not have that column yet.
    # We will just use it for logic below.
    skus_to_insert = [{"id": p["id"], "name": p["name"], "cost_price": p["cost_price"]} for p in products]
    supabase.table('skus').insert(skus_to_insert).execute()

    # 3. Create Demand Profiles (Inputs for MEIO)
    params = []
    for s_id in store_ids:
        for p in products:

            # LOGIC: Adjust stats based on Category
            if p['category'] == 'food':
                # Food sells FAST (50-100 units/day) but arrives quickly (1-2 days lead time)
                avg_demand = random.uniform(50, 150)
                std_dev = random.uniform(10, 30)
                lead_time = random.randint(1, 2)

            elif p['category'] == 'clothing':
                # Clothing sells moderately (10-30 units/day)
                avg_demand = random.uniform(10, 30)
                std_dev = random.uniform(2, 8)
                lead_time = random.randint(3, 5)

            else:  # Footwear
                # Shoes sell slowly (2-8 units/day) and take longer to arrive (5-10 days)
                avg_demand = random.uniform(2, 8)
                std_dev = random.uniform(1, 3)
                lead_time = random.randint(5, 10)

            params.append({
                "sku_id": p['id'],
                "location_id": s_id,
                "avg_daily_demand": round(avg_demand, 2),
                "std_dev_demand": round(std_dev, 2),
                "lead_time_days": lead_time,
                "service_level_target": 0.95
            })

    supabase.table('inventory_params').insert(params).execute()
    print("✅ Bangalore Database Populated Successfully!")


if __name__ == "__main__":
    seed_database()