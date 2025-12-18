import pandas as pd
import pulp
import datetime
from supabase import create_client, Client

# ==========================================
# 1. CONFIGURATION
# ==========================================
SUPABASE_URL = "https://kchzoncfejqsaslppbwk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjaHpvbmNmZWpxc2FzbHBwYndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMzA3NjMsImV4cCI6MjA4MTYwNjc2M30.puPa0NNIAHQfkORQjthWFBzYr16SgpBaho8kdmfErvw"

# ==========================================
# 2. DATA LOADING (SUPABASE)
# ==========================================
class SupabaseConnector:
    def __init__(self, url, key):
        self.client: Client = create_client(url, key)

    def fetch_all(self, table_name):
        """Fetches all rows from a table, handling pagination if necessary."""
        response = self.client.table(table_name).select("*").execute()
        return pd.DataFrame(response.data)

    def write_rows(self, table_name, data):
        """Writes a list of dictionaries to the specified table."""
        if not data:
            return
        
        # Batch insert is recommended for production
        batch_size = 1000
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            try:
                self.client.table(table_name).insert(batch).execute()
                print(f"Written batch {i // batch_size + 1} to {table_name}")
            except Exception as e:
                print(f"Error writing to {table_name}: {e}")

def get_data_from_supabase(db):
    print("Fetching data from Supabase...")
    
    # 1. Fetch Core Tables
    inventory_params = db.fetch_all("inventory_params")
    locations = db.fetch_all("locations")
    meio_results = db.fetch_all("meio_results")
    skus = db.fetch_all("skus")

    # 2. Process Locations
    # Identify Stores and Central DC
    stores = locations[locations['type'] == 'store']['id'].unique()
    try:
        dc_id = locations[locations['type'] == 'central_dc']['id'].iloc[0]
    except IndexError:
        # Fallback if no specific DC type is labeled yet
        print("Warning: No 'central_dc' found. Using first location as DC for testing.")
        dc_id = locations['id'].iloc[0]

    # 3. Merge Data for Optimization
    # Base: Inventory Params (defines valid SKU-Store links)
    df = inventory_params[inventory_params['location_id'].isin(stores)].copy()

    # Join Safety Stock (Latest Recommendation)
    if not meio_results.empty:
        meio_results['created_at'] = pd.to_datetime(meio_results['created_at'])
        # Sort by date and take latest per SKU/Loc
        latest_ss = meio_results.sort_values('created_at', ascending=False).drop_duplicates(subset=['sku_id', 'location_id'])
        df = df.merge(latest_ss[['sku_id', 'location_id', 'safety_stock_recommendation']], 
                      on=['sku_id', 'location_id'], how='left')
    else:
        df['safety_stock_recommendation'] = 0
    
    df['safety_stock_recommendation'] = df['safety_stock_recommendation'].fillna(0)

    # Join Price Info
    df = df.merge(skus[['id', 'cost_price']], left_on='sku_id', right_on='id', how='left')

    # ---------------------------------------------------------
    # TODO: Connect Real Inventory Levels
    # Since 'current_inventory' wasn't in the reference CSVs, 
    # we simulate it here. In production, fetch from 'inventory_levels' table.
    # ---------------------------------------------------------
    print("WARNING: Using simulated Current Inventory levels (Store=5, DC=Unlimited).")
    df['current_store_inventory'] = 5 
    
    # DC Inventory Map (Available Quantity at Warehouse)
    # Simulating 500 units available per SKU at DC
    dc_inventory = {sku: 500 for sku in skus['id'].unique()}
    
    return df, dc_inventory, stores

# ==========================================
# 3. OPTIMIZATION ENGINE
# ==========================================
def run_allocation_optimization(df, dc_inventory):
    print("Building Optimization Model...")
    
    prob = pulp.LpProblem("Allocation_Optimizer", pulp.LpMaximize)

    # Sets & Parameters
    sku_list = df['sku_id'].unique()
    store_list = df['location_id'].unique()
    combinations = list(zip(df['sku_id'], df['location_id']))

    # Lookups for O(1) access
    safety_stock = dict(zip(combinations, df['safety_stock_recommendation']))
    current_inv = dict(zip(combinations, df['current_store_inventory']))
    # Handle missing sell_through_prob safely
    if 'sell_through_prob' in df.columns:
        sell_prob = dict(zip(combinations, df['sell_through_prob']))
    else:
        sell_prob = {k: 0.5 for k in combinations}

    prices = dict(zip(df['sku_id'], df['cost_price']))

    # --- Variables ---
    # How much to ship from DC to Store
    allocation = pulp.LpVariable.dicts("Alloc", combinations, lowBound=0, cat='Integer')
    
    # Slack for missing safety stock (Soft Constraint)
    ss_deficit = pulp.LpVariable.dicts("SS_Deficit", combinations, lowBound=0, cat='Continuous')

    # --- Objective ---
    # Priority 1: Meet Safety Stock (minimize deficit * penalty)
    # Priority 2: Maximize Revenue (Alloc * SellProb * Price)
    
    PENALTY_FACTOR = 10000 
    
    prob += pulp.lpSum([
        -1 * PENALTY_FACTOR * ss_deficit[k] + 
        (allocation[k] * sell_prob.get(k, 0.5) * prices.get(k[0], 0))
        for k in combinations
    ])

    # --- Constraints ---

    # 1. Safety Stock Logic
    # (Existing Stock + Allocation) should act towards satisfying Safety Stock
    # Modeled as: Stock + Alloc + Deficit >= Target
    for k in combinations:
        prob += (current_inv.get(k, 0) + allocation[k] + ss_deficit[k] >= safety_stock.get(k, 0), 
                 f"SS_Constraint_{k}")

    # 2. DC Capacity Logic
    # Sum of allocations for a SKU across all stores <= DC Inventory
    for sku in sku_list:
        relevant_stores = [l for l in store_list if (sku, l) in combinations]
        if not relevant_stores:
            continue
        prob += (pulp.lpSum([allocation[(sku, l)] for l in relevant_stores]) <= dc_inventory.get(sku, 0),
                 f"DC_Capacity_{sku}")

    # --- Solve ---
    print("Solving...")
    solver = pulp.PULP_CBC_CMD(msg=False)
    prob.solve(solver)
    print(f"Status: {pulp.LpStatus[prob.status]}")

    # --- Formulate Results ---
    results = []
    run_id = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    timestamp = datetime.datetime.now().isoformat()

    for k in combinations:
        sku, loc = k
        qty = int(allocation[k].varValue)
        
        # Only record positive allocations or significant deficits
        if qty > 0:
            results.append({
                "run_id": run_id,
                "created_at": timestamp,
                "sku_id": sku,
                "location_id": loc,
                "allocated_quantity": qty, # Already int
                # FIXED: Cast these to int() to prevent 'invalid input syntax for type bigint'
                "safety_stock_target": int(safety_stock.get(k, 0)),
                "current_inventory": int(current_inv.get(k, 0)),
                "status": "pending_approval"
            })
            
    return results

# ==========================================
# 4. MAIN EXECUTION FLOW
# ==========================================
if __name__ == "__main__":
    # Initialize connection
    db = SupabaseConnector(SUPABASE_URL, SUPABASE_KEY)
    
    # Load Data
    data_df, dc_inv_map, stores = get_data_from_supabase(db)
    
    # Run Optimization
    allocations = run_allocation_optimization(data_df, dc_inv_map)
    
    # Write Results
    print(f"Generated {len(allocations)} allocation recommendations.")
    if allocations:
        # NOTE: Ensure you have a table named 'allocations' in Supabase
        db.write_rows("allocations", allocations)
        print("Done.")
    else:
        print("No allocations needed at this time.")