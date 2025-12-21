
const fs = require('fs');
const path = require('path');

try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.log('Error: .env.local file not found');
        process.exit(1);
    }

    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    let hasUrl = false;
    let hasKey = false;
    let errors = [];

    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        if (trimmed.includes('NEXT_PUBLIC_SUPABASE_URL')) {
            hasUrl = true;
            if (trimmed.match(/NEXT_PUBLIC_SUPABASE_URL\s+=/) || trimmed.match(/=\s+/)) {
                errors.push(`Line ${idx + 1}: Spaces around '=' detected. Remove spaces.`);
            }
            if (!trimmed.includes('=')) {
                errors.push(`Line ${idx + 1}: Missing '='.`);
            }
        }
        if (trimmed.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
            hasKey = true;
            if (trimmed.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s+=/) || trimmed.match(/=\s+/)) {
                errors.push(`Line ${idx + 1}: Spaces around '=' detected. Remove spaces.`);
            }
        }
    });

    if (!hasUrl) errors.push('Missing NEXT_PUBLIC_SUPABASE_URL');
    if (!hasKey) errors.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');

    if (errors.length > 0) {
        console.log('Validation Failed:');
        errors.forEach(e => console.log('- ' + e));
    } else {
        console.log('Validation Success: Format looks correct.');
    }

} catch (e) {
    console.error('Script error:', e);
}
