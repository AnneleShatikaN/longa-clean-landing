
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Upload, 
  FileText, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Plus,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupportData } from '@/hooks/useSupportData';

export const DocumentManager: React.FC = () => {
  const { docLinks, addDocLink, updateDocLink, deleteDocLink } = useSupportData();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    url: '',
    file_type: 'external'
  });

  const categories = [
    'User Guides',
    'Video Tutorials', 
    'API Documentation',
    'Policies',
    'Troubleshooting',
    'Getting Started'
  ];

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingDoc) {
        await updateDocLink(editingDoc.id, formData);
      } else {
        await addDocLink(formData);
      }

      setIsModalOpen(false);
      setEditingDoc(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        url: '',
        file_type: 'external'
      });
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const handleEdit = (doc: any) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      description: doc.description || '',
      category: doc.category,
      url: doc.url,
      file_type: doc.file_type
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocLink(docId);
    }
  };

  const getDocIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'video':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <ExternalLink className="h-4 w-4 text-gray-500" />;
    }
  };

  const groupedDocuments = categories.reduce((acc, category) => {
    acc[category] = docLinks.filter(doc => doc.category === category);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Support Documents</h3>
            <p className="text-sm text-gray-600">Manage support documentation and resources</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <Card key={category} className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {category}
                  <Badge variant="outline" className="ml-auto">
                    {groupedDocuments[category]?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {groupedDocuments[category]?.length > 0 ? (
                  groupedDocuments[category].map((doc) => (
                    <div key={doc.id} className="p-3 border rounded-lg group hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getDocIcon(doc.file_type)}
                            <h4 className="text-sm font-medium truncate">{doc.title}</h4>
                          </div>
                          {doc.description && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {doc.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              onClick={() => window.open(doc.url, '_blank')}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleEdit(doc)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No documents in this category</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Document Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDoc ? 'Edit Document' : 'Add New Document'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category *</label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the document"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Document Type</label>
              <Select value={formData.file_type} onValueChange={(value) => setFormData(prev => ({ ...prev, file_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="external">External Link</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="video">Video Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">
                {formData.file_type === 'external' ? 'URL' : 'Document URL'} *
              </label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder={formData.file_type === 'external' ? 'https://...' : 'Upload or paste document URL'}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.file_type === 'external' 
                  ? 'Link to external documentation or website'
                  : 'Upload to cloud storage and paste the public URL here'
                }
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingDoc ? 'Update' : 'Add'} Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
