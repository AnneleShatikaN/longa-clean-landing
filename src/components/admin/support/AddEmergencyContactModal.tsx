
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, AlertTriangle, Shield, Phone } from 'lucide-react';

interface AddEmergencyContactModalProps {
  onAddContact: (
    contactType: string,
    contactValue: string,
    displayName: string,
    description?: string,
    availabilityHours?: string
  ) => Promise<{ success: boolean }>;
}

export const AddEmergencyContactModal: React.FC<AddEmergencyContactModalProps> = ({
  onAddContact
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    contact_type: '',
    contact_value: '',
    display_name: '',
    description: '',
    availability_hours: '24/7'
  });

  const emergencyContactTypes = [
    { value: 'emergency_outage', label: 'System Outage', icon: AlertTriangle, description: 'Critical infrastructure and system outages' },
    { value: 'emergency_security', label: 'Security Emergency', icon: Shield, description: 'Security breaches and suspicious activities' },
    { value: 'emergency_payment', label: 'Payment Emergency', icon: Phone, description: 'Critical payment processing issues' },
    { value: 'emergency_custom', label: 'Custom Emergency', icon: AlertTriangle, description: 'Other emergency contact types' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contact_type || !formData.contact_value || !formData.display_name) return;

    setIsSubmitting(true);
    try {
      const result = await onAddContact(
        formData.contact_type,
        formData.contact_value,
        formData.display_name,
        formData.description,
        formData.availability_hours
      );

      if (result.success) {
        setFormData({
          contact_type: '',
          contact_value: '',
          display_name: '',
          description: '',
          availability_hours: '24/7'
        });
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContactPlaceholder = () => {
    if (formData.contact_type.includes('security') || formData.contact_type.includes('payment')) {
      return 'security@company.com';
    }
    if (formData.contact_type.includes('outage')) {
      return '+264 XX XXX XXXX';
    }
    return 'contact@company.com or +264 XX XXX XXXX';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Emergency Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Emergency Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Contact Type</label>
            <Select value={formData.contact_type} onValueChange={(value) => setFormData({ ...formData, contact_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select emergency contact type" />
              </SelectTrigger>
              <SelectContent>
                {emergencyContactTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <type.icon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Display Name</label>
            <Input
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="e.g., System Outage Emergency"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Contact Value</label>
            <Input
              value={formData.contact_value}
              onChange={(e) => setFormData({ ...formData, contact_value: e.target.value })}
              placeholder={getContactPlaceholder()}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of when to use this contact"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Availability Hours</label>
            <Input
              value={formData.availability_hours}
              onChange={(e) => setFormData({ ...formData, availability_hours: e.target.value })}
              placeholder="e.g., 24/7 or Business hours"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
