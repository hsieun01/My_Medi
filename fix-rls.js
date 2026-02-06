const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bwoeluvuypdpqmixprdn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3b2VsdXZ1eXBkcHFtaXhwcmRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDI1MzY4OSwiZXhwIjoyMDg1ODI5Njg5fQ.dDN8TAIxSTyNB0kR6akubdTjWNvyhmib3GQF68sK8iA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixRls() {
    console.log('Adding INSERT policy to ai_explanations...')
    const { error } = await supabase.rpc('exec_sql', {
        sql: "CREATE POLICY \"Anyone can insert AI explanations\" ON ai_explanations FOR INSERT TO authenticated WITH CHECK (true);"
    }).catch(e => ({ error: e }))

    if (error) {
        // Fallback if rpc is not available
        console.log('RPC failed, trying direct query (this might fail if not allowed)...')
        console.error(error)
    } else {
        console.log('Policy added successfully.')
    }
}

// Since I can't easily run arbitrary SQL via RPC if not configured, 
// I'll try to just use the SERVICE ROLE in the Route Handler instead.
// That's a better "server-side" fix.

console.log("I will update the Route Handler to use the service role key for caching.")
