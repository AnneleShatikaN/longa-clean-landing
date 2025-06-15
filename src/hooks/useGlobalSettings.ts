
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GlobalSetting {
  key: string;
  value: any;
  updated_at: string;
  updated_by: string | null;
}

export const useGlobalSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('key, value, updated_at, updated_by');

      if (error) {
        console.error('[useGlobalSettings] Error fetching settings:', error);
        return;
      }

      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.key] = JSON.parse(setting.value);
        return acc;
      }, {} as Record<string, any>);

      setSettings(settingsMap);
      console.log('[useGlobalSettings] Fetched global settings:', settingsMap);
    } catch (error) {
      console.error('[useGlobalSettings] Error fetching global settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('update_global_setting', {
        setting_key: key,
        setting_value: JSON.stringify(value)
      });

      if (error) {
        console.error('[useGlobalSettings] Error updating setting:', error);
        return false;
      }

      if (data?.success) {
        setSettings(prev => ({
          ...prev,
          [key]: value
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.error('[useGlobalSettings] Error updating setting:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Listen for real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('global_settings_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_settings'
        },
        (payload) => {
          console.log('[useGlobalSettings] Real-time update:', payload);
          
          if (payload.new) {
            const { key, value } = payload.new as GlobalSetting;
            setSettings(prev => ({
              ...prev,
              [key]: JSON.parse(value)
            }));
          }
          
          if (payload.eventType === 'DELETE' && payload.old) {
            const { key } = payload.old as GlobalSetting;
            setSettings(prev => {
              const newSettings = { ...prev };
              delete newSettings[key];
              return newSettings;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    settings,
    isLoading,
    updateSetting,
    refetch: fetchSettings
  };
};
