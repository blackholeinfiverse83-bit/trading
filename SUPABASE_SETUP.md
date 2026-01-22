# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Create a new project
4. Wait for it to be set up

## 2. Get Your Credentials

From your Supabase project dashboard, copy:
- **Project URL** (e.g., `https://your-project.supabase.co`)
- **Anon Key** (public API key)

## 3. Update Environment Variables

### Backend Setup (.env file in `/backend`)
Create or update the `.env` file with:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### Frontend Setup (.env file in `/trading-dashboard`)
Update the `.env` file with:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://127.0.0.1:8001
```

## 4. Configure Supabase Auth Settings

In your Supabase dashboard:
1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Go to **Authentication** > **URL Configuration**
4. Add your app URL to **Redirect URLs**:
   - `http://localhost:8000/*` (for development)
   - `http://localhost:3000/*` (for other dev ports)

## 5. Restart Both Servers

```bash
# Terminal 1: Backend
cd backend
python api_server.py

# Terminal 2: Frontend
cd trading-dashboard
npm run dev
```

## Testing

1. Go to http://localhost:8000
2. Click "Sign Up" and create an account with your email
3. Log in with your credentials
4. You should be redirected to the Dashboard

## Troubleshooting

- If you get "credentials not configured" warning, check your .env files
- Make sure Supabase project is fully initialized
- Check that Email provider is enabled in Supabase
- Verify the redirect URLs are configured correctly
