
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MessageSquare, 
  HelpCircle, 
  Search, 
  Video, 
  FileText, 
  Mail,
  Phone,
  Edit,
  ExternalLink,
  Plus,
  AlertTriangle,
  Shield,
  Trash2,
  Eye
} from 'lucide-react';
import { useSupportData } from '@/hooks/useSupportData';
import { useSupportContacts } from '@/hooks/useSupportContacts';
import { FAQModal } from './FAQModal';
import { EditableContactCard } from './EditableContactCard';
import { AddEmergencyContactModal } from './AddEmergencyContactModal';
import { DocumentManager } from './DocumentManager';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
}

export const SupportSystem: React.FC = () => {
  const { faqs, docLinks, isLoading, addFAQ, updateFAQ, deleteFAQ } = useSupportData();
  const { contacts, isLoading: contactsLoading, updateContact, addEmergencyContact } = useSupportContacts();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const,
  });

  const faqCategories = ['Payments', 'Bookings', 'Accounts', 'Technical', 'General'];

  const createTicket = () => {
    if (!newTicket.title || !newTicket.description || !newTicket.category) {
      return;
    }

    const ticket: Ticket = {
      id: `T${String(tickets.length + 1).padStart(3, '0')}`,
      ...newTicket,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({ title: '', description: '', category: '', priority: 'medium' });
  };

  const handleAddFAQ = () => {
    setModalMode('add');
    setSelectedFAQ(null);
    setIsModalOpen(true);
  };

  const handleEditFAQ = (faq: any) => {
    setModalMode('edit');
    setSelectedFAQ(faq);
    setIsModalOpen(true);
  };

  const handleSaveFAQ = async (question: string, answer: string, category: string) => {
    await addFAQ(question, answer, category);
  };

  const handleUpdateFAQ = async (id: string, updates: any) => {
    await updateFAQ(id, updates);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in_progress': return 'secondary';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRegularContacts = () => {
    return contacts.filter(contact => 
      !contact.is_emergency && (
        contact.contact_type === 'email' || 
        contact.contact_type === 'phone' || 
        contact.contact_type === 'live_chat'
      )
    );
  };

  const getEmergencyContacts = () => {
    return contacts.filter(contact => 
      contact.is_emergency || 
      contact.contact_type.includes('emergency')
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Support System</h1>
            <p className="text-gray-600">Manage customer support content and channels</p>
          </div>
        </div>

        <Tabs defaultValue="faqs" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faqs">FAQ Management</TabsTrigger>
            <TabsTrigger value="documentation">Documents</TabsTrigger>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="contact">Contact Channels</TabsTrigger>
          </TabsList>

          <TabsContent value="faqs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2" />
                      FAQ Management
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Create and manage frequently asked questions for customers
                    </p>
                  </div>
                  <Button onClick={handleAddFAQ}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search FAQs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {faqCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading FAQs...</div>
                ) : (
                  <div className="space-y-4">
                    {filteredFAQs.map((faq) => (
                      <div key={faq.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm sm:text-base">{faq.question}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{faq.category}</Badge>
                            <span className="text-xs text-gray-500">{faq.views} views</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditFAQ(faq)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => deleteFAQ(faq.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
                    {filteredFAQs.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No FAQs found matching your criteria.</p>
                        <Button onClick={handleAddFAQ} className="mt-4">
                          Create Your First FAQ
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <DocumentManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Ticket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      placeholder="Ticket title"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Textarea
                      placeholder="Describe the issue..."
                      value={newTicket.description}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newTicket.category} onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Payment">Payment Issues</SelectItem>
                        <SelectItem value="Authentication">Login/Account</SelectItem>
                        <SelectItem value="Booking">Booking Problems</SelectItem>
                        <SelectItem value="Technical">Technical Issues</SelectItem>
                        <SelectItem value="General">General Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={createTicket} className="w-full">
                    Create Ticket
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Recent Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No support tickets yet</p>
                      <p className="text-sm">Create a ticket to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((ticket) => (
                        <div key={ticket.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{ticket.title}</h4>
                            <div className="flex space-x-2">
                              <Badge variant={getPriorityColor(ticket.priority) as any}>
                                {ticket.priority}
                              </Badge>
                              <Badge variant={getStatusColor(ticket.status) as any}>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{ticket.category}</span>
                            <span>{ticket.createdAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Channels</CardTitle>
                  <p className="text-sm text-gray-600">
                    Manage your support contact information. Click edit to update values.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactsLoading ? (
                    <div className="text-center py-8">Loading contacts...</div>
                  ) : (
                    <div className="space-y-4">
                      {getRegularContacts().map((contact) => (
                        <EditableContactCard
                          key={contact.id}
                          contact={contact}
                          onUpdate={updateContact}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Emergency Contacts</CardTitle>
                      <p className="text-sm text-gray-600">
                        Critical contact information for system emergencies. Click edit to update values.
                      </p>
                    </div>
                    <AddEmergencyContactModal onAddContact={addEmergencyContact} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactsLoading ? (
                    <div className="text-center py-8">Loading emergency contacts...</div>
                  ) : getEmergencyContacts().length > 0 ? (
                    <div className="space-y-4">
                      {getEmergencyContacts().map((contact) => (
                        <EditableContactCard
                          key={contact.id}
                          contact={contact}
                          onUpdate={updateContact}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No emergency contacts configured</p>
                      <p className="text-sm">Add emergency contacts for critical situations</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <FAQModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveFAQ}
          onUpdate={handleUpdateFAQ}
          onDelete={deleteFAQ}
          faq={selectedFAQ}
          mode={modalMode}
        />
      </div>
    </TooltipProvider>
  );
};
