
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://skctjajjhtvxwafyekig.supabase.co';
const supabaseKey = 'sb_publishable_wlz5l_Zxnklr7Wh0i0D2Dg_D8dqNe72';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking connection...');

    // 1. Try to basic select from profiles
    console.log('Attempting to select * from profiles...');
    const { data, error, status } = await supabase.from('profiles').select('*').limit(1);

    console.log('Status:', status);
    if (error) {
        console.error('Error selecting profiles:', error);
    } else {
        console.log('Success! Data:', data);
    }

    // 2. Try inserting a dummy row if possible (auth prevents this usually)
    // 3. Check if table definition is visible (using RPC if allowed, or just inferring)
}

check();
