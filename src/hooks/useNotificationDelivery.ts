
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeliveryAttempt {
  id: string;
  notification_id: string;
  channel: 'email' | 'sms' | 'push' | 'in_app';
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed';
  attempted_at: string;
  delivered_at?: string;
  error_message?: string;
  retry_count: number;
}

export const useNotificationDelivery = () => {
  const [deliveryLog, setDeliveryLog] = useState<DeliveryAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Retry failed notification delivery
  const retryDelivery = async (notificationId: string, channel: string) => {
    setIsLoading(true);
    try {
      let response;
      
      if (channel === 'sms') {
        response = await supabase.functions.invoke('send-sms-notification', {
          body: { notification_id: notificationId }
        });
      } else if (channel === 'email') {
        response = await supabase.functions.invoke('send-email-notification', {
          body: { notification_id: notificationId }
        });
      }

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Delivery Retry Successful",
        description: `Notification resent via ${channel.toUpperCase()}`,
      });

      // Refresh delivery log
      await fetchDeliveryLog();
      
    } catch (error: any) {
      console.error('Retry delivery failed:', error);
      toast({
        title: "Retry Failed",
        description: `Failed to resend notification via ${channel.toUpperCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch delivery log for a specific notification
  const fetchDeliveryLog = async (notificationId?: string) => {
    try {
      let query = supabase
        .from('notification_delivery_log')
        .select('*')
        .order('attempted_at', { ascending: false });

      if (notificationId) {
        query = query.eq('notification_id', notificationId);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error fetching delivery log:', error);
        return;
      }

      setDeliveryLog(data || []);
    } catch (error) {
      console.error('Error fetching delivery log:', error);
    }
  };

  // Send notification with automatic fallback
  const sendWithFallback = async (
    userId: string,
    type: string,
    title: string,
    message: string,
    urgency: 'emergency' | 'high' | 'normal' = 'normal',
    data?: any
  ) => {
    try {
      // Always send in-app notification
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          channel: 'in_app',
          title,
          message,
          priority: urgency,
          data
        })
        .select()
        .single();

      if (notificationError) {
        throw notificationError;
      }

      // Get user's notification preferences
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type);

      const userPrefs = preferences?.[0] || {};

      // For critical notifications, implement fallback strategy
      if (urgency === 'emergency' || urgency === 'high') {
        const deliveryChannels = [];

        // Try email first if enabled
        if (userPrefs.email_enabled !== false) {
          deliveryChannels.push('email');
        }

        // SMS for emergency/high priority
        if (userPrefs.sms_enabled !== false || urgency === 'emergency') {
          deliveryChannels.push('sms');
        }

        // Push notifications
        if (userPrefs.push_enabled !== false) {
          deliveryChannels.push('push');
        }

        // Attempt delivery through each channel
        for (const channel of deliveryChannels) {
          try {
            if (channel === 'email') {
              await supabase.functions.invoke('send-email-notification', {
                body: {
                  notification_id: notification.id,
                  to: userId,
                  template_name: type,
                  variables: { title, message, ...data }
                }
              });
            } else if (channel === 'sms') {
              await supabase.functions.invoke('send-sms-notification', {
                body: {
                  notification_id: notification.id,
                  to: userId,
                  message: `${title}: ${message}`
                }
              });
            }

            // Log successful attempt
            await supabase.from('notification_delivery_log').insert({
              notification_id: notification.id,
              channel,
              delivery_status: 'sent',
              attempted_at: new Date().toISOString()
            });

          } catch (channelError) {
            // Log failed attempt
            await supabase.from('notification_delivery_log').insert({
              notification_id: notification.id,
              channel,
              delivery_status: 'failed',
              attempted_at: new Date().toISOString(),
              error_message: channelError.message
            });

            console.error(`Failed to send via ${channel}:`, channelError);
          }
        }
      }

      return notification;

    } catch (error) {
      console.error('Error sending notification with fallback:', error);
      throw error;
    }
  };

  // Calculate delivery success rate
  const getDeliveryStats = () => {
    const total = deliveryLog.length;
    const successful = deliveryLog.filter(log => 
      log.delivery_status === 'delivered' || log.delivery_status === 'sent'
    ).length;
    const failed = deliveryLog.filter(log => log.delivery_status === 'failed').length;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0
    };
  };

  useEffect(() => {
    fetchDeliveryLog();
  }, []);

  return {
    deliveryLog,
    isLoading,
    retryDelivery,
    fetchDeliveryLog,
    sendWithFallback,
    getDeliveryStats
  };
};
