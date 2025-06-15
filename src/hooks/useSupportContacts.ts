
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';

export interface SupportContact {
  id: string;
  contact_type: string;
  contact_value: string;
  display_name: string;
  description?: string;
  availability_hours?: string;
  is_active: boolean;
  is_verified: boolean;
  is_emergency?: boolean;
  created_at: string;
  updated_at: string;
}

interface UpdateContactResponse {
  success: boolean;
  error?: string;
  message?: string;
  is_verified?: boolean;
}

export const useSupportContacts = () => {
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useEnhancedToast();

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('support_contacts')
        .select('*')
        .eq('is_active', true)
        .order('contact_type');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching support contacts:', error);
      toast.error('Failed to load support contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const updateContact = async (
    contactType: string,
    contactValue: string,
    displayName?: string,
    description?: string,
    availabilityHours?: string,
    isEmergency?: boolean
  ) => {
    try {
      const { data, error } = await supabase.rpc('update_support_contact', {
        p_contact_type: contactType,
        p_contact_value: contactValue,
        p_display_name: displayName,
        p_description: description,
        p_availability_hours: availabilityHours,
        p_is_emergency: isEmergency
      });

      if (error) throw error;

      const response = data as unknown as UpdateContactResponse;

      if (response?.success) {
        toast.success('Contact updated successfully');
        await fetchContacts();
        return { success: true, isVerified: response.is_verified || false };
      } else {
        throw new Error(response?.error || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
      return { success: false, isVerified: false };
    }
  };

  const addEmergencyContact = async (
    contactType: string,
    contactValue: string,
    displayName: string,
    description?: string,
    availabilityHours?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('support_contacts')
        .insert([{
          contact_type: contactType,
          contact_value: contactValue,
          display_name: displayName,
          description,
          availability_hours: availabilityHours,
          is_emergency: true,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Emergency contact added successfully');
      await fetchContacts();
      return { success: true, data };
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      toast.error('Failed to add emergency contact');
      return { success: false };
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    isLoading,
    updateContact,
    addEmergencyContact,
    refreshContacts: fetchContacts
  };
};
