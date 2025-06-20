
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Folder, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
}

interface ProviderCategorySelectorProps {
  onSave?: () => void;
  showTitle?: boolean;
}

export const ProviderCategorySelector: React.FC<ProviderCategorySelectorProps> = ({ 
  onSave, 
  showTitle = true 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCategories();
      fetchProviderCategories();
    }
  }, [user?.id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, description')
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

  const fetchProviderCategories = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('provider_categories')
        .select('category_id')
        .eq('provider_id', user.id);

      if (error) throw error;
      setSelectedCategories(data?.map(pc => pc.category_id) || []);
    } catch (error) {
      console.error('Error fetching provider categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);

      // First, delete existing provider categories
      const { error: deleteError } = await supabase
        .from('provider_categories')
        .delete()
        .eq('provider_id', user.id);

      if (deleteError) throw deleteError;

      // Then, insert new selections
      if (selectedCategories.length > 0) {
        const insertData = selectedCategories.map(categoryId => ({
          provider_id: user.id,
          category_id: categoryId
        }));

        const { error: insertError } = await supabase
          .from('provider_categories')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Service categories updated successfully",
      });

      onSave?.();
    } catch (error) {
      console.error('Error saving provider categories:', error);
      toast({
        title: "Error",
        description: "Failed to update service categories",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Service Categories
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select the service categories you provide to help clients find you
          </p>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {categories.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="h-4 w-4" />
            <span>No service categories available</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={category.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {category.name}
                    </label>
                    {category.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedCategories.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Selected Categories:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(categoryId => {
                    const category = categories.find(c => c.id === categoryId);
                    return category ? (
                      <Badge key={categoryId} variant="default">
                        {category.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Categories'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
