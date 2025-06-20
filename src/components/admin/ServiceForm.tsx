
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ServiceData, serviceSchema } from '@/schemas/validation';
import { useServices } from '@/contexts/ServiceContext';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { useToast } from '@/hooks/use-toast';

interface ServiceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onSuccess, onCancel }) => {
  const { createService } = useServices();
  const { categories } = useServiceCategories();
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ServiceData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      type: 'one-off',
      status: 'active',
      commissionPercentage: 15,
      duration: { hours: 1, minutes: 0 },
      tags: []
    }
  });

  const serviceType = watch('type');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const onSubmit = async (data: ServiceData) => {
    setIsSubmitting(true);
    try {
      await createService(data);
      toast({
        title: "Success",
        description: "Service created successfully",
      });
      reset();
      setTags([]);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Service</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter service name"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Service Type *</Label>
              <Select onValueChange={(value) => setValue('type', value as 'one-off' | 'subscription')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-off">One-off Service</SelectItem>
                  <SelectItem value="subscription">Subscription Service</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="category">Service Category</Label>
            <Select onValueChange={(value) => setValue('categoryId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your service"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="clientPrice">Client Price (N$) *</Label>
              <Input
                id="clientPrice"
                type="number"
                step="0.01"
                {...register('clientPrice', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.clientPrice && (
                <p className="text-sm text-red-600 mt-1">{errors.clientPrice.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="providerFee">Provider Fee (N$)</Label>
              <Input
                id="providerFee"
                type="number"
                step="0.01"
                {...register('providerFee', { valueAsNumber: true })}
                placeholder="Auto-calculated"
              />
            </div>

            <div>
              <Label htmlFor="commissionPercentage">Commission (%)</Label>
              <Input
                id="commissionPercentage"
                type="number"
                step="0.01"
                {...register('commissionPercentage', { valueAsNumber: true })}
                placeholder="15"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration-hours">Duration (Hours)</Label>
              <Input
                id="duration-hours"
                type="number"
                min="0"
                {...register('duration.hours', { valueAsNumber: true })}
                placeholder="1"
              />
            </div>

            <div>
              <Label htmlFor="duration-minutes">Duration (Minutes)</Label>
              <Input
                id="duration-minutes"
                type="number"
                min="0"
                max="59"
                {...register('duration.minutes', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Service'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceForm;
