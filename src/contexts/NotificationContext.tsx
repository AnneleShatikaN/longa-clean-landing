
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
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updatePreferences: (type: string, preferences: Partial<NotificationPreferencesRow>) => Promise<void>;
  sendMessage: (recipientId: string, content: string, bookingId?: string) => Promise<void>;
  createSupportTicket: (subject: string, description: string, category: string, priority?: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferencesRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicketRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read && n.channel === 'in_app').length;

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
            
            // Show toast for in-app notifications
            if (newNotification.channel === 'in_app') {
              toast({
                title: newNotification.title,
                description: newNotification.message,
                duration: 5000,
              });
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
    markAsRead,
    markAllAsRead,
    updatePreferences,
    sendMessage,
    createSupportTicket,
    refreshNotifications
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
