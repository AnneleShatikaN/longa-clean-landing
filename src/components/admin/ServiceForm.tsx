
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Home, Car, Shirt, Utensils, Zap, Heart } from 'lucide-react';
import { serviceSchema, ServiceData } from '@/schemas/validation';
import { useServices } from '@/contexts/ServiceContext';
import { toast } from 'sonner';

const serviceCategories = [
  { id: 'home-cleaning', name: 'Home Cleaning', icon: Home },
  { id: 'laundry', name: 'Laundry & Ironing', icon: Shirt },
  { id: 'car-care', name: 'Car Care', icon: Car },
  { id: 'food-services', name: 'Food Services', icon: Utensils },
  { id: 'maintenance', name: 'Home Maintenance', icon: Zap },
  { id: 'personal-care', name: 'Personal Care', icon: Heart },
];

const serviceIcons = [
  'Home', 'Shirt', 'Car', 'Utensils', 'Zap', 'Heart', 'Wrench', 'Scissors', 
  'Coffee', 'Truck', 'Bed', 'Bath', 'Kitchen', 'Garden', 'Baby', 'Pet'
];

const namibianRegions = [
  'Windhoek', 'Swakopmund', 'Walvis Bay', 'Rundu', 'Oshakati', 'Katima Mulilo',
  'Otjiwarongo', 'Gobabis', 'Rehoboth', 'Mariental', 'Keetmanshoop', 'Tsumeb',
  'Okahandja', 'Outjo', 'Karasburg', 'Grootfontein'
];

interface ServiceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onSuccess, onCancel }) => {
  const { createService } = useServices();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [coverageAreas, setCoverageAreas] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ServiceData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      type: 'one-off',
      clientPrice: 50,
      commissionPercentage: 15,
      duration: { hours: 1, minutes: 0 },
      status: 'active',
      tags: [],
      description: '',
      requirements: []
    }
  });

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      form.setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    form.setValue('tags', updatedTags);
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      const updatedReqs = [...requirements, newRequirement.trim()];
      setRequirements(updatedReqs);
      form.setValue('requirements', updatedReqs);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (reqToRemove: string) => {
    const updatedReqs = requirements.filter(req => req !== reqToRemove);
    setRequirements(updatedReqs);
    form.setValue('requirements', updatedReqs);
  };

  const validateCurrentStep = () => {
    const values = form.getValues();
    
    switch (currentStep) {
      case 1:
        return values.name && values.type;
      case 2:
        return values.clientPrice >= 50 && values.commissionPercentage >= 5;
      case 3:
        return values.description;
      case 4:
        return true; // Coverage areas are optional
      default:
        return false;
    }
  };

  const onSubmit = async (data: ServiceData) => {
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!data.name || !data.type) {
        toast.error('Please fill in all required fields (title and type)');
        setIsSubmitting(false);
        return;
      }

      // Create the service with all collected data
      await createService({
        ...data,
        tags: tags.length > 0 ? tags : ['general'],
        requirements: requirements
      });
      
      toast.success('Service created successfully!');
      
      // Reset form and state
      form.reset();
      setTags([]);
      setRequirements([]);
      setCoverageAreas([]);
      setCurrentStep(1);
      setSelectedCategory('');
      setSelectedIcon('');
      
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create service. Please try again.');
      console.error('Service creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please complete all required fields before proceeding');
    }
  };
  
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Create New Service
          <div className="text-sm text-gray-500">Step {currentStep} of 4</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={`step-${currentStep}`} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="step-1">Basic Info</TabsTrigger>
                <TabsTrigger value="step-2">Pricing</TabsTrigger>
                <TabsTrigger value="step-3">Details</TabsTrigger>
                <TabsTrigger value="step-4">Coverage</TabsTrigger>
              </TabsList>

              <TabsContent value="step-1" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Deep House Cleaning" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="one-off">One-off Service</SelectItem>
                            <SelectItem value="subscription">Subscription Package</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {serviceCategories.map((category) => (
                      <Button
                        key={category.id}
                        type="button"
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        className="flex items-center gap-2 h-auto p-3"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <category.icon className="h-4 w-4" />
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Service Icon</Label>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-2">
                    {serviceIcons.map((icon) => (
                      <Button
                        key={icon}
                        type="button"
                        variant={selectedIcon === icon ? "default" : "outline"}
                        className="aspect-square"
                        onClick={() => setSelectedIcon(icon)}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="step-2" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clientPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Price (NAD) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="50" 
                            max="5000" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="commissionPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commission Percentage (%) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="5" 
                            max="30" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration.hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration - Hours</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="8" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration.minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration - Minutes</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="59" 
                            step="15"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="step-3" className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this service includes..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label>Service Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
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

                <div>
                  <Label>Equipment/Requirements</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add requirement..."
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                    />
                    <Button type="button" onClick={handleAddRequirement}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1 mt-2">
                    {requirements.map((req) => (
                      <div key={req} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{req}</span>
                        <X 
                          className="h-4 w-4 cursor-pointer text-gray-500" 
                          onClick={() => handleRemoveRequirement(req)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="step-4" className="space-y-4">
                <div>
                  <Label>Coverage Areas in Namibia</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {namibianRegions.map((region) => (
                      <div key={region} className="flex items-center space-x-2">
                        <Switch
                          checked={coverageAreas.includes(region)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCoverageAreas([...coverageAreas, region]);
                            } else {
                              setCoverageAreas(coverageAreas.filter(r => r !== region));
                            }
                          }}
                        />
                        <Label className="text-sm">{region}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-between pt-4">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                {currentStep < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Service'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ServiceForm;
