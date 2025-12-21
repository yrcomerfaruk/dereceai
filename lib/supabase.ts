
import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder to prevent build crash if env vars are missing (e.g. during specific Vercel build phases or if forgotten)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase Environment Variables are missing. Authentication will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

