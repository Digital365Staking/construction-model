
import pandas as pd
from supabase import create_client, Client

# Supabase credentials
SUPABASE_URL = "https://ydxelzxjsuemylifgwte.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeGVsenhqc3VlbXlsaWZnd3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MDY4MzAsImV4cCI6MjA1MjE4MjgzMH0.Nnbgsp8NvJaD_DyXpsNwnvrdZUwZz4ylWzv7_fglxPo"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load CSV file
df = pd.read_csv("contact.csv")

# Generate SQL to create table
table_name = "contact_csv"

# Replace NaN with None (valid for JSON)
df = df.where(pd.notna(df), None)

column_definitions = ", ".join([f'"{col}" TEXT' for col in df.columns])  # Default to TEXT type
create_table_sql = f'CREATE TABLE {table_name} (id SERIAL PRIMARY KEY, {column_definitions});'

# Execute the SQL query (you need to enable SQL execution via an RPC function in Supabase)
response = supabase.rpc("execute_sql", {"query": create_table_sql}).execute()
print(response)

# Insert data into the new table
data = df.to_dict(orient="records")
supabase.table(table_name).insert(data).execute()
print("Data inserted successfully!")



