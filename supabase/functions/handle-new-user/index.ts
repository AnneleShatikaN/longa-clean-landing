
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { record } = await req.json();
    
    console.log('Creating user profile for:', record.id, record.email);
    console.log('User metadata:', record.raw_user_meta_data);

    // Create user profile in the users table
    const { error } = await supabaseAdmin
      .from('users')
      .insert({
        id: record.id,
        email: record.email,
        password_hash: 'managed_by_supabase_auth',
        full_name: record.raw_user_meta_data?.full_name || record.email.split('@')[0],
        phone: record.raw_user_meta_data?.phone || null,
        role: record.raw_user_meta_data?.role || 'client',
        current_work_location: record.raw_user_meta_data?.work_location || null,
        is_active: true,
        rating: 0,
        total_jobs: 0,
      });

    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }

    console.log('User profile created successfully for:', record.email);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in handle-new-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

serve(handler);
