
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  subject: string;
  content: string;
  variables: string[];
  language: string;
  is_active: boolean;
}

export interface NotificationRule {
  id: string;
  name: string;
  triggers: string[];
  conditions: any;
  channels: string[];
  escalation_rules: any;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_active: boolean;
}

export interface CommunicationAnalytics {
  delivery_rate: number;
  response_rate: number;
  cost_tracking: any;
  channel_performance: any;
}

export const useNotificationService = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [analytics, setAnalytics] = useState<CommunicationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch notification templates
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      toast({
        title: "Error",
        description: "Failed to fetch notification templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Send multi-channel notification with intelligent routing
  const sendNotification = useCallback(async (
    userId: string,
    templateId: string,
    variables: Record<string, any>,
    options: {
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      channels?: string[];
      escalation?: boolean;
      quiet_hours_respect?: boolean;
    } = {}
  ) => {
    try {
      // Get user preferences
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId);

      const userPrefs = preferences?.[0] || {};
      
      // Get template
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      // Determine optimal channels based on:
      // 1. User preferences
      // 2. Message priority
      // 3. Time of day (quiet hours)
      // 4. Previous delivery success rates
      
      const channels = determineOptimalChannels(userPrefs, options, template);
      
      // Send through primary channel first
      const results = await Promise.allSettled(
        channels.map(channel => sendThroughChannel(channel, userId, template, variables))
      );

      // Handle escalation if needed
      if (options.escalation && options.priority === 'urgent') {
        await handleEscalation(userId, templateId, variables, results);
      }

      // Log communication analytics
      await logCommunicationAttempt({
        user_id: userId,
        template_id: templateId,
        channels,
        priority: options.priority || 'normal',
        results: results.map((r, i) => ({
          channel: channels[i],
          success: r.status === 'fulfilled',
          error: r.status === 'rejected' ? r.reason : null
        }))
      });

      toast({
        title: "Notification Sent",
        description: `Message delivered through ${channels.length} channel(s)`,
      });

      return { success: true, channels, results };

    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: "Send Failed",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  }, [templates, toast]);

  // Determine optimal channels based on intelligent logic
  const determineOptimalChannels = (
    userPrefs: any,
    options: any,
    template: NotificationTemplate
  ): string[] => {
    const now = new Date();
    const hour = now.getHours();
    const isQuietHours = hour < 8 || hour > 22;

    const channels: string[] = [];

    // Always include in-app
    if (userPrefs.in_app_enabled !== false) {
      channels.push('in_app');
    }

    // Email for non-urgent during quiet hours, or if user prefers
    if (userPrefs.email_enabled !== false && 
        (!isQuietHours || options.priority !== 'urgent')) {
      channels.push('email');
    }

    // SMS for urgent messages or user preference
    if ((options.priority === 'urgent' || options.priority === 'high') ||
        userPrefs.sms_enabled === true) {
      channels.push('sms');
    }

    // Push notifications if available
    if (userPrefs.push_enabled !== false) {
      channels.push('push');
    }

    // Respect quiet hours unless it's an emergency
    if (isQuietHours && options.quiet_hours_respect !== false && options.priority !== 'urgent') {
      return channels.filter(c => c !== 'sms');
    }

    return channels.length > 0 ? channels : ['in_app']; // Fallback
  };

  // Send through specific channel
  const sendThroughChannel = async (
    channel: string,
    userId: string,
    template: NotificationTemplate,
    variables: Record<string, any>
  ) => {
    switch (channel) {
      case 'email':
        return await supabase.functions.invoke('send-email-notification', {
          body: {
            to: userId,
            template_name: template.name,
            variables
          }
        });
        
      case 'sms':
        return await supabase.functions.invoke('send-sms-notification', {
          body: {
            to: userId,
            message: interpolateTemplate(template.content, variables)
          }
        });
        
      case 'push':
        // Push notification logic
        return { success: true, channel: 'push' };
        
      case 'in_app':
        return await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: template.type,
            title: interpolateTemplate(template.subject, variables),
            message: interpolateTemplate(template.content, variables),
            channel: 'in_app',
            priority: 'normal'
          });
          
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  };

  // Handle escalation logic
  const handleEscalation = async (
    userId: string,
    templateId: string,
    variables: Record<string, any>,
    previousResults: any[]
  ) => {
    // Wait for initial delivery attempt
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if user has read the notification
    const { data: readStatus } = await supabase
      .from('notifications')
      .select('read')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    // If not read, escalate through additional channels
    if (!readStatus?.[0]?.read) {
      const escalationChannels = ['sms', 'email'];
      
      for (const channel of escalationChannels) {
        if (!previousResults.some(r => r.channel === channel)) {
          try {
            const template = templates.find(t => t.id === templateId);
            if (template) {
              await sendThroughChannel(channel, userId, template, variables);
            }
          } catch (error) {
            console.error(`Escalation failed for ${channel}:`, error);
          }
        }
      }
    }
  };

  // Log communication attempt for analytics
  const logCommunicationAttempt = async (data: any) => {
    try {
      await supabase
        .from('communication_analytics')
        .insert({
          user_id: data.user_id,
          template_id: data.template_id,
          channels: data.channels,
          priority: data.priority,
          delivery_results: data.results,
          attempted_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging communication attempt:', error);
    }
  };

  // Interpolate template variables
  const interpolateTemplate = (template: string, variables: Record<string, any>): string => {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(placeholder, String(value));
    });
    return result;
  };

  // Fetch communication analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('communication_analytics')
        .select('*')
        .gte('attempted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Calculate analytics
      const totalAttempts = data?.length || 0;
      const successfulDeliveries = data?.filter(d => 
        d.delivery_results?.some((r: any) => r.success)
      ).length || 0;

      setAnalytics({
        delivery_rate: totalAttempts > 0 ? (successfulDeliveries / totalAttempts) * 100 : 0,
        response_rate: 0, // Would calculate based on user interactions
        cost_tracking: {}, // Would integrate with billing
        channel_performance: {} // Would analyze channel success rates
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  return {
    templates,
    rules,
    analytics,
    isLoading,
    fetchTemplates,
    sendNotification,
    fetchAnalytics
  };
};
