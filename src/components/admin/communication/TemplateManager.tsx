
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Bell,
  MessageSquare,
  Globe,
  Eye
} from 'lucide-react';
import { useNotificationService } from '@/hooks/useNotificationService';
import { useToast } from '@/hooks/use-toast';

export const TemplateManager: React.FC = () => {
  const { templates, fetchTemplates, isLoading } = useNotificationService();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    subject: '',
    content: '',
    language: 'en',
    variables: [] as string[]
  });

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      case 'push': return <Bell className="h-4 w-4" />;
      case 'in_app': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleSaveTemplate = async () => {
    try {
      // Extract variables from content
      const variableMatches = formData.content.match(/{{(\w+)}}/g) || [];
      const extractedVars = variableMatches.map(match => match.replace(/[{}]/g, ''));

      const templateData = {
        ...formData,
        variables: extractedVars,
        is_active: true
      };

      // In a real app, this would save to the database
      toast({
        title: "Template Saved",
        description: `${formData.name} template has been saved successfully`,
      });

      setIsCreateModalOpen(false);
      setEditTemplate(null);
      setFormData({
        name: '',
        type: 'email',
        subject: '',
        content: '',
        language: 'en',
        variables: []
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const mockTemplates = [
    {
      id: '1',
      name: 'Booking Confirmation',
      type: 'email',
      subject: 'Your booking is confirmed - {{service_name}}',
      content: 'Hi {{client_name}}, your booking for {{service_name}} on {{booking_date}} is confirmed.',
      language: 'en',
      variables: ['client_name', 'service_name', 'booking_date'],
      is_active: true
    },
    {
      id: '2',
      name: 'Payment Reminder',
      type: 'sms',
      subject: '',
      content: 'Hi {{client_name}}, your payment of N${{amount}} is due. Please pay to continue service.',
      language: 'en',
      variables: ['client_name', 'amount'],
      is_active: true
    }
  ];

  const displayTemplates = templates.length > 0 ? templates : mockTemplates;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notification Templates</h3>
          <p className="text-gray-600">Create and manage notification templates</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayTemplates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getTypeIcon(template.type)}
                  {template.name}
                </CardTitle>
                <Badge variant={template.is_active ? "default" : "secondary"}>
                  {template.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase">{template.type}</p>
                {template.subject && (
                  <p className="text-sm font-medium">{template.subject}</p>
                )}
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {template.content}
                </p>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <Globe className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">{template.language}</span>
                {template.variables.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {template.variables.length} vars
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setFormData(template);
                    setEditTemplate(template);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Template Modal */}
      <Dialog open={isCreateModalOpen || !!editTemplate} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setEditTemplate(null);
          setFormData({
            name: '',
            type: 'email',
            subject: '',
            content: '',
            language: 'en',
            variables: []
          });
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Booking Confirmation"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.type === 'email' || formData.type === 'push') && (
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Your booking is confirmed - {{service_name}}"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Hi {{client_name}}, your booking for {{service_name}} is confirmed."
                className="min-h-[120px]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {`{{variable_name}}`} for dynamic content
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setIsCreateModalOpen(false);
                setEditTemplate(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                {editTemplate ? 'Update' : 'Create'} Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getTypeIcon(previewTemplate.type)}
                {previewTemplate.name} Preview
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {previewTemplate.subject && (
                <div>
                  <label className="text-sm font-medium">Subject:</label>
                  <p className="p-2 bg-gray-50 rounded border">{previewTemplate.subject}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Content:</label>
                <p className="p-3 bg-gray-50 rounded border whitespace-pre-wrap">
                  {previewTemplate.content}
                </p>
              </div>
              {previewTemplate.variables.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Variables:</label>
                  <div className="flex gap-1 flex-wrap">
                    {previewTemplate.variables.map((variable: string) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
