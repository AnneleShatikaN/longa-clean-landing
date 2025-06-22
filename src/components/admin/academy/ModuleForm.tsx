import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useLearningModules } from '@/hooks/useLearningModules';
import { ServiceType } from '@/types/learning';

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'car_wash', label: 'Car Wash' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'painting', label: 'Painting' },
  { value: 'maintenance', label: 'Maintenance' }
];

interface ModuleFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingModuleId?: string | null;
  defaultServiceType?: ServiceType;
  onSuccess: () => void;
}

export const ModuleForm: React.FC<ModuleFormProps> = ({
  isOpen,
  onClose,
  editingModuleId,
  defaultServiceType,
  onSuccess
}) => {
  const { modules, createModule, updateModule } = useLearningModules();
  
  const [formData, setFormData] = useState({
    service_type: defaultServiceType || 'cleaning' as ServiceType,
    title: '',
    description: '',
    youtube_url: '',
    notes: '',
    notes_pdf_url: '',
    is_published: false,
    display_order: 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editingModule = editingModuleId ? modules.find(m => m.id === editingModuleId) : null;

  useEffect(() => {
    if (editingModule) {
      setFormData({
        service_type: editingModule.service_type,
        title: editingModule.title,
        description: editingModule.description || '',
        youtube_url: editingModule.youtube_url || '',
        notes: editingModule.notes || '',
        notes_pdf_url: editingModule.notes_pdf_url || '',
        is_published: editingModule.is_published,
        display_order: editingModule.display_order
      });
    } else {
      setFormData({
        service_type: defaultServiceType || 'cleaning',
        title: '',
        description: '',
        youtube_url: '',
        notes: '',
        notes_pdf_url: '',
        is_published: false,
        display_order: 0
      });
    }
  }, [editingModule, defaultServiceType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingModuleId) {
        await updateModule(editingModuleId, formData);
      } else {
        await createModule(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save module:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingModuleId ? 'Edit Learning Module' : 'Create Learning Module'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData({ ...formData, service_type: value as ServiceType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Basic House Cleaning Techniques"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what this module covers..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube_url">YouTube Video URL</Label>
            <Input
              id="youtube_url"
              type="url"
              value={formData.youtube_url}
              onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {formData.youtube_url && !isYouTubeUrl(formData.youtube_url) && (
              <p className="text-sm text-red-600">Please enter a valid YouTube URL</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional text content, tips, or instructions..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes_pdf_url">PDF Resource URL</Label>
            <Input
              id="notes_pdf_url"
              type="url"
              value={formData.notes_pdf_url}
              onChange={(e) => setFormData({ ...formData, notes_pdf_url: e.target.value })}
              placeholder="https://example.com/resource.pdf"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
            <Label htmlFor="is_published">Publish immediately</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
              {isSubmitting ? 'Saving...' : editingModuleId ? 'Update Module' : 'Create Module'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
