import os
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")
# wait, .env in backend only has GEMINI_API_KEY. .env in root has VITE_SUPABASE_URL
load_dotenv(".env")

url: str = os.environ.get("VITE_SUPABASE_URL")
key: str = os.environ.get("VITE_SUPABASE_ANON_KEY")

supabase: Client = create_client(url, key)
print("Supabase connected.")

# Actually, the python client doesn't easily let us query system catalogs for RLS policies if anon key doesn't have access.
# Wait, let's just insert and update a profile and see if it throws an error!
res = supabase.auth.sign_up({"email": "test_rls@example.com", "password": "password123"})
user_id = res.user.id

# test insert
insert_res = supabase.table('profiles').insert({
    "user_id": user_id,
    "name": "Test",
    "monthly_income": 0
}).execute()
print("Insert:", insert_res)

# test update
update_res = supabase.table('profiles').update({
    "monthly_income": 50000
}).eq("user_id", user_id).execute()
print("Update:", update_res)

# test select
select_res = supabase.table('profiles').select('*').eq("user_id", user_id).execute()
print("Select:", select_res)

