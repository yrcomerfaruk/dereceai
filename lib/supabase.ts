
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    // Only log in development to avoid leaking info, but here needed for debugging
    console.error('Supabase Credentials Missing in Client. Check .env.local');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

