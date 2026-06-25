# FinCopilot Deployment Checklist

## Render (Backend)
1. Create a new Web Service in Render.
2. Connect your GitHub repository.
3. Select `Python 3` as the environment.
4. Set Build Command: `pip install -r backend/requirements.txt`
5. Set Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Gemini API key.
   - `ALLOWED_ORIGINS`: `*` (or your specific Vercel URL once known).
   - `PYTHON_VERSION`: `3.10.0` (or your preferred version).

## Supabase (Database & Auth)
1. Go to your Supabase Dashboard.
2. Ensure you have the `chats`, `profiles`, and `transactions` tables configured.
3. In Authentication > URL Configuration:
   - Add your Vercel URL to the **Site URL**.
   - Add your Vercel URL to the **Redirect URLs**.

## Vercel (Frontend)
1. Create a new Project in Vercel.
2. Connect your GitHub repository.
3. Vercel will automatically detect `Vite`.
4. Add Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Project Anon Key.
   - `VITE_API_URL`: The URL of your deployed Render backend (e.g., `https://fincopilot-backend.onrender.com/api`).
5. Deploy!

## Final Verification
- Log in to the frontend via Vercel.
- Ask the Copilot a question and check if the backend handles the request without CORS errors.
- Test the Simulator to ensure backend calculations work.
