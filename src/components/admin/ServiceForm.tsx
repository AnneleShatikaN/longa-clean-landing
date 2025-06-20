
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
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

interface ValidationErrors {
  name?: string;
  categoryId?: string;
  clientPrice?: string;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onSuccess, onCancel }) => {
  const { createService } = useServices();
  const { toast } = useToast();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
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
      setIsCategoriesLoading(true);
      setCategoriesError(null);
      
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      
      setCategories(data || []);
      
      if (!data || data.length === 0) {
        setCategoriesError('No service categories available. Please create categories first.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesError('Failed to load service categories. Please try again.');
      toast({
        title: "Error Loading Categories",
        description: "Failed to load service categories. Please refresh the page and try again.",
        variant: "destructive",
      });
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Service name is required';
    }
    
    if (!formData.categoryId) {
      errors.categoryId = 'Service category is required';
    }
    
    if (!formData.clientPrice || parseFloat(formData.clientPrice) <= 0) {
      errors.clientPrice = 'Client price must be greater than 0';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
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
        action: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Created</span>
          </div>
        ),
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Service Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create service. Please check your connection and try again.",
        variant: "destructive",
        action: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>Error</span>
          </div>
        ),
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

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear validation error when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="flex items-center gap-1">
            Service Name 
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., House Cleaning"
            className={validationErrors.name ? 'border-red-500' : ''}
            required
          />
          {validationErrors.name && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validationErrors.name}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="category" className="flex items-center gap-1">
            Service Category 
            <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={formData.categoryId} 
            onValueChange={(value) => handleInputChange('categoryId', value)}
            disabled={isCategoriesLoading}
          >
            <SelectTrigger className={validationErrors.categoryId ? 'border-red-500' : ''}>
              <SelectValue placeholder={
                isCategoriesLoading ? "Loading categories..." : 
                categoriesError ? "Error loading categories" :
                "Select category"
              } />
            </SelectTrigger>
            <SelectContent>
              {isCategoriesLoading ? (
                <SelectItem value="" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                </SelectItem>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  No categories available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {validationErrors.categoryId && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validationErrors.categoryId}
            </p>
          )}
          {categoriesError && !validationErrors.categoryId && (
            <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {categoriesError}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
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
          <Label htmlFor="clientPrice" className="flex items-center gap-1">
            Client Price (N$) 
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="clientPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.clientPrice}
            onChange={(e) => handleInputChange('clientPrice', e.target.value)}
            placeholder="0.00"
            className={validationErrors.clientPrice ? 'border-red-500' : ''}
            required
          />
          {validationErrors.clientPrice && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validationErrors.clientPrice}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="providerFee">Provider Fee (N$)</Label>
          <Input
            id="providerFee"
            type="number"
            step="0.01"
            min="0"
            value={formData.providerFee}
            onChange={(e) => handleInputChange('providerFee', e.target.value)}
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
            onChange={(e) => handleInputChange('commissionPercentage', e.target.value)}
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
        <Button type="submit" disabled={isSubmitting || isCategoriesLoading}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Service...
            </div>
          ) : (
            'Create Service'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
