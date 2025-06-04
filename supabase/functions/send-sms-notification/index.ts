
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  to: string;
  message: string;
  notification_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, message, notification_id }: SMSRequest = await req.json();

    // Here you would integrate with SMS service (e.g., Twilio, Africa's Talking, etc.)
    // For simulation, we'll just log the SMS and mark as delivered
    console.log('SMS would be sent:', {
      to: to.substring(0, 4) + '****' + to.substring(to.length - 2), // Mask phone number
      message: message.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });

    // Simulate SMS delivery delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update notification delivery status
    if (notification_id) {
      await supabase
        .from('notification_delivery_log')
        .insert({
          notification_id,
          channel: 'sms',
          delivery_status: 'delivered',
          delivery_details: { to: to.substring(0, 4) + '****', message_length: message.length },
          delivered_at: new Date().toISOString()
        });

      await supabase
        .from('notifications')
        .update({ 
          delivered: true,
          delivery_attempted_at: new Date().toISOString()
        })
        .eq('id', notification_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully',
        sms_id: `sim_${Date.now()}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);
