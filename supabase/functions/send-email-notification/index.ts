
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  template_name: string;
  variables: Record<string, any>;
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

    const { to, template_name, variables, notification_id }: EmailRequest = await req.json();

    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', template_name)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      throw new Error('Email template not found');
    }

    // Replace variables in template
    let htmlContent = template.html_content;
    let textContent = template.text_content || '';
    let subject = template.subject;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
      textContent = textContent.replace(new RegExp(placeholder, 'g'), String(value));
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Here you would integrate with your email service (e.g., Resend, SendGrid, etc.)
    // For simulation, we'll just log the email and mark as delivered
    console.log('Email would be sent:', {
      to,
      subject,
      htmlContent: htmlContent.substring(0, 100) + '...',
      textContent: textContent.substring(0, 100) + '...'
    });

    // Update notification delivery status
    if (notification_id) {
      await supabase
        .from('notification_delivery_log')
        .insert({
          notification_id,
          channel: 'email',
          delivery_status: 'sent',
          delivery_details: { to, subject, template_name },
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
        message: 'Email sent successfully',
        email_id: `sim_${Date.now()}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error sending email:', error);
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
