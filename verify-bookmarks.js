const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bwoeluvuypdpqmixprdn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3b2VsdXZ1eXBkcHFtaXhwcmRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1MzY4OSwiZXhwIjoyMDg1ODI5Njg5fQ.dDN8TAIxSTyNB0kR6akubdTjWNvyhmib3GQF68sK8iA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyBookmarkLogic() {
    console.log('--- Verifying Bookmark Logic ---');

    // 1. Get a disease ID
    const { data: disease } = await supabase.from('diseases').select('id, title').limit(1).single();
    if (!disease) {
        console.error('No diseases found in database.');
        return;
    }
    console.log(`Found disease: ${disease.title} (${disease.id})`);

    const userId = '3e86f874-954f-4d43-9844-0c5a2c42c94c'; // Test user ID from existing data or auth

    // 2. Insert a bookmark
    console.log('Inserting bookmark...');
    const { data: bookmark, error: insertError } = await supabase
        .from('saved_items')
        .insert({
            user_id: userId,
            type: 'disease',
            target_id: disease.id
        })
        .select()
        .single();

    if (insertError) {
        console.error('Insert error:', insertError);
        return;
    }
    console.log('Bookmark inserted:', bookmark.id);

    // 3. Simulate Joined Fetch
    console.log('Simulating joined fetch...');
    const { data: savedItems } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', userId);

    const diseaseIds = savedItems.filter(s => s.type === 'disease').map(s => s.target_id);
    const { data: diseases } = await supabase.from('diseases').select('*').in('id', diseaseIds);

    const diseasesMap = new Map(diseases.map(d => [d.id, d]));
    const joinedItems = savedItems.map(s => ({
        ...s,
        originalData: s.type === 'disease' ? diseasesMap.get(s.target_id) : null
    }));

    console.log('Joined items found:', joinedItems.length);
    const target = joinedItems.find(i => i.target_id === disease.id);
    if (target && target.originalData && target.originalData.title === disease.title) {
        console.log('✅ Joined fetch successful: Original data retrieved correctly.');
    } else {
        console.error('❌ Joined fetch failed or data mismatch.');
    }

    // 4. Cleanup
    console.log('Cleaning up...');
    await supabase.from('saved_items').delete().eq('id', bookmark.id);
    console.log('Bookmark removed.');
    console.log('--- Verification Complete ---');
}

verifyBookmarkLogic();
