
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, Users, Settings } from 'lucide-react';
import { useFAQSystem } from '@/hooks/useFAQSystem';

export const FAQManagement = () => {
  const { faqs, categories, isLoading, createFAQ, updateFAQ, deleteFAQ } = useFAQSystem();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    priority: 0,
    visibility_rules: {
      show_all: true,
      user_roles: ['client', 'provider', 'admin'],
      pages: ['all']
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFAQ) {
        await updateFAQ(editingFAQ.id, formData);
      } else {
        await createFAQ(formData);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      priority: 0,
      visibility_rules: {
        show_all: true,
        user_roles: ['client', 'provider', 'admin'],
        pages: ['all']
      }
    });
    setEditingFAQ(null);
  };

  const handleEdit = (faq: any) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      priority: faq.priority,
      visibility_rules: faq.visibility_rules
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      await deleteFAQ(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">FAQ Management</h2>
          <p className="text-gray-600">Manage frequently asked questions with dynamic visibility</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the detailed answer"
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Bookings">Bookings</SelectItem>
                      <SelectItem value="Payments">Payments</SelectItem>
                      <SelectItem value="Providers">Providers</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    min="0"
                    max="10"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Visibility Settings</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.visibility_rules.show_all}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        visibility_rules: { ...formData.visibility_rules, show_all: checked }
                      })
                    }
                  />
                  <Label>Show to all users</Label>
                </div>
                
                {!formData.visibility_rules.show_all && (
                  <div className="space-y-2">
                    <Label>User Roles</Label>
                    <div className="flex flex-wrap gap-2">
                      {['client', 'provider', 'admin'].map(role => (
                        <div key={role} className="flex items-center space-x-2">
                          <Switch
                            checked={formData.visibility_rules.user_roles.includes(role)}
                            onCheckedChange={(checked) => {
                              const roles = checked 
                                ? [...formData.visibility_rules.user_roles, role]
                                : formData.visibility_rules.user_roles.filter(r => r !== role);
                              setFormData({
                                ...formData,
                                visibility_rules: { ...formData.visibility_rules, user_roles: roles }
                              });
                            }}
                          />
                          <Label className="capitalize">{role}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All FAQs ({faqs.length})</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading FAQs...</div>
          ) : faqs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No FAQs found. Create your first FAQ to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {faqs.map(faq => (
                <Card key={faq.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{faq.category}</Badge>
                          <Badge variant="secondary">
                            <Eye className="h-3 w-3 mr-1" />
                            {faq.views} views
                          </Badge>
                          {faq.priority > 0 && (
                            <Badge variant="default">Priority: {faq.priority}</Badge>
                          )}
                          {faq.visibility_rules.show_all ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Users className="h-3 w-3 mr-1" />
                              All Users
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Settings className="h-3 w-3 mr-1" />
                              Restricted
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(faq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(faq.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              {faqs.filter(faq => faq.category === category).map(faq => (
                <Card key={faq.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(faq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(faq.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
