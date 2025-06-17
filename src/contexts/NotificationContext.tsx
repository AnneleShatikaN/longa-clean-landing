import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type NotificationPreferencesRow = Database['public']['Tables']['notification_preferences']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];
type SupportTicketRow = Database['public']['Tables']['support_tickets']['Row'];

interface NotificationContextType {
  notifications: NotificationRow[];
  unreadCount: number;
  preferences: NotificationPreferencesRow[];
  messages: MessageRow[];
  supportTickets: SupportTicketRow[];
  isLoading: boolean;
  isAvailable: boolean;
  setAvailability: (available: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updatePreferences: (type: string, preferences: Partial<NotificationPreferencesRow>) => Promise<void>;
  sendMessage: (recipientId: string, content: string, bookingId?: string) => Promise<void>;
  createSupportTicket: (subject: string, description: string, category: string, priority?: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  sendJobAssignmentNotification: (providerId: string, jobDetails: any, urgency: 'emergency' | 'priority' | 'standard') => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferencesRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicketRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailableState] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read && n.channel === 'in_app').length;

  // Set provider availability
  const setAvailability = async (available: boolean) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_available: available })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating availability:', error);
        toast({
          title: "Error",
          description: "Failed to update availability status.",
          variant: "destructive",
        });
        return;
      }

      setIsAvailableState(available);
      
      toast({
        title: available ? "Now Available" : "Now Unavailable",
        description: available 
          ? "You will receive job assignments" 
          : "You won't receive new job assignments",
      });
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  // Send job assignment notification with urgency levels
  const sendJobAssignmentNotification = async (
    providerId: string, 
    jobDetails: any, 
    urgency: 'emergency' | 'priority' | 'standard'
  ) => {
    try {
      const urgencyConfig = {
        emergency: {
          title: '🚨 EMERGENCY JOB ASSIGNED',
          priority: 'urgent',
          channels: ['in_app', 'sms', 'email']
        },
        priority: {
          title: '⚡ Priority Job Assigned',
          priority: 'high',
          channels: ['in_app', 'sms']
        },
        standard: {
          title: 'Job Assigned to You',
          priority: 'normal',
          channels: ['in_app']
        }
      };

      const config = urgencyConfig[urgency];
      const message = `${jobDetails.serviceName} - ${jobDetails.date} at ${jobDetails.time}\nLocation: ${jobDetails.location}\nPayment: N$${jobDetails.amount}`;

      // Send notifications through multiple channels based on urgency
      for (const channel of config.channels) {
        await supabase.from('notifications').insert({
          user_id: providerId,
          type: 'job_assigned',
          channel,
          title: config.title,
          message,
          priority: config.priority,
          data: {
            booking_id: jobDetails.id,
            urgency,
            service_name: jobDetails.serviceName,
            client_name: jobDetails.clientName,
            amount: jobDetails.amount,
            location: jobDetails.location,
            date: jobDetails.date,
            time: jobDetails.time
          }
        });
      }

      // For emergency jobs, also trigger immediate SMS/email via edge functions
      if (urgency === 'emergency') {
        try {
          await supabase.functions.invoke('send-sms-notification', {
            body: {
              to: jobDetails.providerPhone,
              message: `🚨 EMERGENCY JOB: ${jobDetails.serviceName} assigned to you. Check app immediately.`,
              notification_type: 'emergency_assignment'
            }
          });
        } catch (error) {
          console.error('Failed to send emergency SMS:', error);
        }
      }

    } catch (error) {
      console.error('Error sending job assignment notification:', error);
    }
  };

  // Fetch user notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch notification preferences
  const fetchPreferences = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching preferences:', error);
        return;
      }
      setPreferences(data || []);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(full_name, avatar_url),
          recipient:users!messages_recipient_id_fkey(full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch support tickets
  const fetchSupportTickets = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching support tickets:', error);
        return;
      }
      setSupportTickets(data || []);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all as read:', error);
        toast({
          title: "Error",
          description: "Failed to mark notifications as read.",
          variant: "destructive",
        });
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      toast({
        title: "Notifications Marked as Read",
        description: "All notifications have been marked as read.",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read.",
        variant: "destructive",
      });
    }
  };

  // Update notification preferences
  const updatePreferences = async (type: string, newPreferences: Partial<NotificationPreferencesRow>) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          type,
          ...newPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating preferences:', error);
        toast({
          title: "Error",
          description: "Failed to update notification preferences.",
          variant: "destructive",
        });
        return;
      }

      await fetchPreferences();
      
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      });
    }
  };

  // Send message
  const sendMessage = async (recipientId: string, content: string, bookingId?: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          booking_id: bookingId || null,
          message_type: 'text'
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message.",
          variant: "destructive",
        });
        return;
      }

      await fetchMessages();
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  // Create support ticket
  const createSupportTicket = async (subject: string, description: string, category: string, priority: string = 'normal') => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject,
          description,
          category,
          priority,
          status: 'open'
        });

      if (error) {
        console.error('Error creating support ticket:', error);
        toast({
          title: "Error",
          description: "Failed to create support ticket.",
          variant: "destructive",
        });
        return;
      }

      await fetchSupportTickets();
      
      toast({
        title: "Support Ticket Created",
        description: "Your support ticket has been created. We'll get back to you soon.",
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create support ticket.",
        variant: "destructive",
      });
    }
  };

  // Refresh all data
  const refreshNotifications = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all([
        fetchNotifications(),
        fetchPreferences(),
        fetchMessages(),
        fetchSupportTickets()
      ]);

      // Get user availability status
      const { data: userData } = await supabase
        .from('users')
        .select('is_available')
        .eq('id', user.id)
        .single();
      
      if (userData) {
        setIsAvailableState(userData.is_available ?? true);
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to notifications
    const notificationChannel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as NotificationRow;
            setNotifications(prev => [newNotification, ...prev]);
            
            // Show toast for in-app notifications with urgency handling
            if (newNotification.channel === 'in_app') {
              const isUrgent = newNotification.priority === 'urgent' || newNotification.priority === 'high';
              
              toast({
                title: newNotification.title,
                description: newNotification.message,
                duration: isUrgent ? 10000 : 5000,
                variant: newNotification.priority === 'urgent' ? 'destructive' : 'default',
              });

              // Voice notification for job assignments
              if (newNotification.type === 'job_assigned' && 'speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(
                  `New job assignment: ${newNotification.title}`
                );
                utterance.rate = 0.8;
                speechSynthesis.speak(utterance);
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev =>
              prev.map(n => n.id === payload.new.id ? payload.new as NotificationRow : n)
            );
          }
        }
      )
      .subscribe();

    // Subscribe to messages
    const messageChannel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchMessages(); // Refetch to get joined data
          }
        }
      )
      .subscribe();

    // Subscribe to support tickets
    const supportChannel = supabase
      .channel('support-tickets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchSupportTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(supportChannel);
    };
  }, [user?.id]);

  // Initial data fetch
  useEffect(() => {
    refreshNotifications();
  }, [user?.id]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    preferences,
    messages,
    supportTickets,
    isLoading,
    isAvailable,
    setAvailability,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    sendMessage,
    createSupportTicket,
    refreshNotifications,
    sendJobAssignmentNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
