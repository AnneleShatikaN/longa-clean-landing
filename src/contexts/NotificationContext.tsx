
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreference {
  id: string;
  user_id: string;
  type: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  timezone: string;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  created_at: string;
  data?: any;
}

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  resolution?: string;
  created_at: string;
}

interface NotificationContextType {
  preferences: NotificationPreference[];
  notifications: Notification[];
  supportTickets: SupportTicket[];
  messages: any[];
  unreadCount: number;
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (type: string, updates: Partial<NotificationPreference>) => Promise<void>;
  setAvailability: (available: boolean) => Promise<void>;
  sendNotification: (userId: string, type: string, title: string, message: string, urgency?: string, data?: any) => Promise<void>;
  fetchPreferences: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createSupportTicket: (subject: string, description: string, category: string, priority: string) => Promise<void>;
  sendMessage: (recipientId: string, content: string, bookingId?: string | null) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isAvailable, setIsAvailableState] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read && n.channel === 'in_app').length;

  const fetchPreferences = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences(data || []);

      // Fetch user availability status
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_available')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user availability:', userError);
      } else {
        setIsAvailableState(userData?.is_available ?? true);
      }

    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching notification preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchSupportTickets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupportTickets(data || []);
    } catch (err: any) {
      console.error('Error fetching support tickets:', err);
    }
  };

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(full_name, avatar_url),
          recipient:users!messages_recipient_id_fkey(full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
    }
  };

  const updatePreferences = async (type: string, updates: Partial<NotificationPreference>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          type,
          ...updates
        }, {
          onConflict: 'user_id,type'
        });

      if (error) throw error;

      // Update local state
      setPreferences(prev => {
        const existingIndex = prev.findIndex(p => p.type === type);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...updates };
          return updated;
        } else {
          return [...prev, {
            id: `temp-${Date.now()}`,
            user_id: user.id,
            type,
            email_enabled: true,
            sms_enabled: false,
            push_enabled: true,
            in_app_enabled: true,
            quiet_hours_start: null,
            quiet_hours_end: null,
            timezone: 'Africa/Windhoek',
            ...updates
          }];
        }
      });

      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });

    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update preferences: " + err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const setAvailability = async (available: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_available: available })
        .eq('id', user.id);

      if (error) throw error;

      setIsAvailableState(available);

      toast({
        title: available ? "Now Available" : "Now Unavailable",
        description: available 
          ? "You will receive job assignments" 
          : "You will not receive new job assignments",
      });

    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update availability: " + err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const sendNotification = async (
    userId: string,
    type: string,
    title: string,
    message: string,
    urgency: string = 'normal',
    data: any = {}
  ) => {
    try {
      const { error } = await supabase.rpc('send_notification', {
        p_user_id: userId,
        p_type: type,
        p_title: title,
        p_message: message,
        p_data: data,
        p_priority: urgency
      });

      if (error) throw error;

    } catch (err: any) {
      console.error('Error sending notification:', err);
      toast({
        title: "Notification Error",
        description: "Failed to send notification: " + err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );

      toast({
        title: "All notifications marked as read",
        description: "Your notifications have been updated.",
      });
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const createSupportTicket = async (
    subject: string,
    description: string,
    category: string,
    priority: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject,
          description,
          category,
          priority,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;

      setSupportTickets(prev => [data, ...prev]);

      toast({
        title: "Support ticket created",
        description: "Your ticket has been submitted successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to create support ticket: " + err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const sendMessage = async (recipientId: string, content: string, bookingId?: string | null) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          booking_id: bookingId,
          message_type: 'text'
        })
        .select(`
          *,
          sender:users!messages_sender_id_fkey(full_name, avatar_url),
          recipient:users!messages_recipient_id_fkey(full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setMessages(prev => [data, ...prev]);

      toast({
        title: "Message sent",
        description: "Your message has been delivered.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to send message: " + err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPreferences();
      fetchNotifications();
      fetchSupportTickets();
      fetchMessages();
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      preferences,
      notifications,
      supportTickets,
      messages,
      unreadCount,
      isAvailable,
      isLoading,
      error,
      updatePreferences,
      setAvailability,
      sendNotification,
      fetchPreferences,
      markAsRead,
      markAllAsRead,
      createSupportTicket,
      sendMessage
    }}>
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
