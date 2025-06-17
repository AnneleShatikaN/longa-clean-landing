
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

interface NotificationContextType {
  preferences: NotificationPreference[];
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (type: string, updates: Partial<NotificationPreference>) => Promise<void>;
  setAvailability: (available: boolean) => Promise<void>;
  sendNotification: (userId: string, type: string, title: string, message: string, urgency?: string, data?: any) => Promise<void>;
  fetchPreferences: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isAvailable, setIsAvailableState] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      preferences,
      isAvailable,
      isLoading,
      error,
      updatePreferences,
      setAvailability,
      sendNotification,
      fetchPreferences
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
