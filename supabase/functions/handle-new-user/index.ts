
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { record } = await req.json()
    
    // Extract user metadata
    const userData = record.raw_user_meta_data || {}
    
    // Insert user profile
    const { error } = await supabaseClient
      .from('users')
      .insert({
        id: record.id,
        email: record.email,
        password_hash: 'managed_by_supabase_auth',
        full_name: userData.full_name || record.email,
        phone: userData.phone,
        role: userData.role || 'client',
        current_work_location: userData.location,
        provider_category: userData.provider_category,
        is_active: true,
        rating: 0,
        total_jobs: 0
      })

    if (error) {
      console.error('Error inserting user:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
