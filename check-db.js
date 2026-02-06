
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE // Use service role to bypass RLS

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
    console.log('Checking diseases table...')
    const { data: diseases, error: dError } = await supabase.from('diseases').select('id, title').limit(5)
    if (dError) console.error('Diseases error:', dError)
    else console.log('Diseases found:', diseases)

    console.log('Checking drugs table...')
    const { data: drugs, error: drError } = await supabase.from('drugs').select('id, title').limit(5)
    if (drError) console.error('Drugs error:', drError)
    else console.log('Drugs found:', drugs)
}

checkData()
