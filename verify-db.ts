
import { supabase } from './lib/supabase';

async function verifyDb() {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
            console.log('Not logged in:', authError.message);
            return;
        }
        if (!user) {
            console.log('No active user.');
            return;
        }
        console.log('Current User ID:', user.id);

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            // Check if error is related to table existing
            if (error.code === '42P01') {
                console.error("CRITICAL: 'profiles' table does not exist!");
            }
        } else {
            console.log('Profile found:', data);
        }
    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

verifyDb();
