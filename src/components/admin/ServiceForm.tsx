
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useServices } from '@/contexts/ServiceContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ServiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ServiceCategory {
  id: string;
  name: string;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onSuccess, onCancel }) => {
  const { createService } = useServices();
  const { toast } = useToast();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'one-off' as 'one-off' | 'subscription',
    clientPrice: '',
    providerFee: '',
    commissionPercentage: '15',
    durationHours: '1',
    durationMinutes: '0',
    status: 'active' as 'active' | 'inactive',
    categoryId: '',
    tags: [] as string[]
  });
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load service categories",
        variant: "destructive",
      });
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.clientPrice || !formData.categoryId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Price, and Category)",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const serviceData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        clientPrice: parseFloat(formData.clientPrice),
        providerFee: formData.providerFee ? parseFloat(formData.providerFee) : undefined,
        commissionPercentage: parseFloat(formData.commissionPercentage),
        duration: {
          hours: parseInt(formData.durationHours),
          minutes: parseInt(formData.durationMinutes)
        },
        status: formData.status,
        tags: formData.tags.length > 0 ? formData.tags : ['general'],
        categoryId: formData.categoryId
      };

      console.log('Creating service with data:', serviceData);
      
      const newService = await createService(serviceData);
      
      console.log('Service created successfully:', newService);
      
      toast({
        title: "Success!",
        description: `Service "${formData.name}" has been created successfully.`,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Service Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., House Cleaning"
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Service Category *</Label>
          <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the service..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Service Type</Label>
          <Select value={formData.type} onValueChange={(value: 'one-off' | 'subscription') => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one-off">One-off Service</SelectItem>
              <SelectItem value="subscription">Subscription Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="clientPrice">Client Price (N$) *</Label>
          <Input
            id="clientPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.clientPrice}
            onChange={(e) => setFormData({ ...formData, clientPrice: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <Label htmlFor="providerFee">Provider Fee (N$)</Label>
          <Input
            id="providerFee"
            type="number"
            step="0.01"
            min="0"
            value={formData.providerFee}
            onChange={(e) => setFormData({ ...formData, providerFee: e.target.value })}
            placeholder="Auto-calculated"
          />
        </div>

        <div>
          <Label htmlFor="commission">Commission (%)</Label>
          <Input
            id="commission"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.commissionPercentage}
            onChange={(e) => setFormData({ ...formData, commissionPercentage: e.target.value })}
            placeholder="15"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="durationHours">Duration Hours</Label>
          <Input
            id="durationHours"
            type="number"
            min="0"
            max="24"
            value={formData.durationHours}
            onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="durationMinutes">Duration Minutes</Label>
          <Input
            id="durationMinutes"
            type="number"
            min="0"
            max="59"
            value={formData.durationMinutes}
            onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            id="tags"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a tag and press Enter"
          />
          <Button type="button" onClick={handleAddTag} variant="outline" disabled={!currentTag.trim()}>
            Add
          </Button>
        </div>
        
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Service...' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
