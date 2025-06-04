
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending notifications that need to be delivered
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select(`
        *,
        user:users(email, phone, full_name)
      `)
      .eq('delivered', false)
      .is('delivery_attempted_at', null)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) throw error;

    console.log(`Processing ${notifications?.length || 0} notifications`);

    for (const notification of notifications || []) {
      try {
        // Mark as attempted
        await supabase
          .from('notifications')
          .update({ delivery_attempted_at: new Date().toISOString() })
          .eq('id', notification.id);

        // Process based on channel
        switch (notification.channel) {
          case 'email':
            if (notification.user?.email) {
              await supabase.functions.invoke('send-email-notification', {
                body: {
                  to: notification.user.email,
                  template_name: getEmailTemplate(notification.type),
                  variables: {
                    first_name: notification.user.full_name?.split(' ')[0] || 'User',
                    ...JSON.parse(notification.data || '{}')
                  },
                  notification_id: notification.id
                }
              });
            }
            break;

          case 'sms':
            if (notification.user?.phone) {
              await supabase.functions.invoke('send-sms-notification', {
                body: {
                  to: notification.user.phone,
                  message: `${notification.title}: ${notification.message}`,
                  notification_id: notification.id
                }
              });
            }
            break;

          case 'push':
            // Push notification logic would go here
            console.log('Push notification would be sent:', {
              user_id: notification.user_id,
              title: notification.title,
              body: notification.message
            });
            break;

          case 'in_app':
            // In-app notifications are handled by real-time subscriptions
            await supabase
              .from('notifications')
              .update({ delivered: true })
              .eq('id', notification.id);
            break;
        }

      } catch (notificationError) {
        console.error(`Error processing notification ${notification.id}:`, notificationError);
        
        // Log the failure
        await supabase
          .from('notification_delivery_log')
          .insert({
            notification_id: notification.id,
            channel: notification.channel,
            delivery_status: 'failed',
            error_message: notificationError.message,
            failed_at: new Date().toISOString()
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: notifications?.length || 0,
        message: 'Notifications processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error processing notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

function getEmailTemplate(notificationType: string): string {
  switch (notificationType) {
    case 'booking_confirmation':
      return 'booking_confirmation';
    case 'payment_received':
      return 'payment_receipt';
    default:
      return 'welcome_email';
  }
}

serve(handler);
