
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
    
    // Extract user metadata with better error handling
    const userData = record.raw_user_meta_data || {}
    const userRole = userData.role || 'client'
    const providerCategory = userData.provider_category || null
    
    console.log('Creating user profile with data:', {
      id: record.id,
      email: record.email,
      full_name: userData.full_name || record.email,
      phone: userData.phone,
      role: userRole,
      current_work_location: userData.current_work_location,
      provider_category: providerCategory
    })

    // Validate required fields for providers
    if (userRole === 'provider' && !providerCategory) {
      console.error('Provider category is missing for provider user:', record.id)
      return new Response(JSON.stringify({ 
        error: 'Provider category is required for provider accounts',
        missing_field: 'provider_category'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    // Insert user profile with all required fields
    const { error } = await supabaseClient
      .from('users')
      .insert({
        id: record.id,
        email: record.email,
        password_hash: 'managed_by_supabase_auth',
        full_name: userData.full_name || record.email,
        phone: userData.phone || null,
        role: userRole,
        current_work_location: userData.current_work_location || null,
        provider_category: providerCategory,
        is_active: true,
        rating: 0,
        total_jobs: 0,
        verification_status: userRole === 'provider' ? 'pending' : 'verified'
      })

    if (error) {
      console.error('Error inserting user:', error)
      return new Response(JSON.stringify({ 
        error: error.message,
        details: error.details || 'Database insertion failed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    console.log('User profile created successfully for:', userRole, providerCategory ? `(${providerCategory})` : '')
    return new Response(JSON.stringify({ 
      success: true,
      message: 'User profile created successfully',
      user_role: userRole,
      provider_category: providerCategory
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in handle-new-user function:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      stack: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
