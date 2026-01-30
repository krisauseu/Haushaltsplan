
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_API_URL || '';
// Fallback logic to get the URL part if VITE_API_URL is proxied or handled differently, 
// but typically Supabase URL is distinct. The user has .env with SUPABASE_URL.
// Let's assume the user will expose VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY 
// or I need to update .env to include VITE_ prefix for these to be accessible in frontend.
// The existing .env has SUPABASE_URL and SUPABASE_ANON_KEY without VITE_ prefix.
// I must update .env first or assume they are adding VITE_ prefix is part of the plan.
// Wait, I should check .env again. It has SUPABASE_URL. Vite only exposes VITE_* by default.
// I will need to update .env to have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.

const projectUrl = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!projectUrl || !anonKey) {
    console.error('Missing Supabase configuration:', { projectUrl, anonKey });
}

export const supabase = createClient(projectUrl, anonKey);
