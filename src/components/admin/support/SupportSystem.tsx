
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  HelpCircle, 
  Search, 
  Video, 
  FileText, 
  Mail,
  Phone
} from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
}

const mockTickets: Ticket[] = [
  {
    id: 'T001',
    title: 'Payment not processing',
    description: 'Customer unable to complete payment for booking',
    status: 'open',
    priority: 'high',
    category: 'Payment',
    createdAt: '2024-01-15',
  },
  {
    id: 'T002',
    title: 'App login issues',
    description: 'User cannot access their account',
    status: 'in_progress',
    priority: 'medium',
    category: 'Authentication',
    createdAt: '2024-01-14',
  },
];

const mockFAQs: FAQItem[] = [
  {
    id: 'F001',
    question: 'How do I cancel a booking?',
    answer: 'You can cancel a booking by going to your booking history and clicking the cancel button. Please note our cancellation policy.',
    category: 'Bookings',
    views: 245,
  },
  {
    id: 'F002',
    question: 'How do payments work?',
    answer: 'Payments are processed securely through our payment gateway. You can pay with credit card, debit card, or mobile money.',
    category: 'Payments',
    views: 189,
  },
  {
    id: 'F003',
    question: 'How do I become a service provider?',
    answer: 'To become a service provider, register on our platform, complete your profile, and wait for verification. The process usually takes 24-48 hours.',
    category: 'Providers',
    views: 156,
  },
];

export const SupportSystem: React.FC = () => {
  const [tickets, setTickets] = useState(mockTickets);
  const [faqs, setFAQs] = useState(mockFAQs);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as const,
  });

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

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support System</h1>
          <p className="text-gray-600">Customer support and help center</p>
        </div>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ Management</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="contact">Contact Channels</TabsTrigger>
        </TabsList>

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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2" />
                FAQ Management
              </CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button>Add FAQ</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{faq.question}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{faq.category}</Badge>
                        <span className="text-xs text-gray-500">{faq.views} views</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  User Guides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    Getting Started Guide
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Booking Tutorial
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Payment Guide
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Account Management
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  Video Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    How to Book a Service
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Provider Registration
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Using the Mobile App
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Troubleshooting
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    Authentication API
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Booking API
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Payment API
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Webhook Reference
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-600">support@longa.com</p>
                    <p className="text-xs text-gray-500">24/7 response within 2 hours</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-gray-600">+264 XX XXX XXXX</p>
                    <p className="text-xs text-gray-500">Mon-Fri 8AM-6PM WAT</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-purple-500" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-gray-600">Available in app</p>
                    <p className="text-xs text-gray-500">Instant response during business hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-red-800">System Outage</p>
                  <p className="text-sm text-red-600">+264 XX XXX XXXX (24/7)</p>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium text-yellow-800">Payment Issues</p>
                  <p className="text-sm text-yellow-600">payments@longa.com</p>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-blue-800">Security Concerns</p>
                  <p className="text-sm text-blue-600">security@longa.com</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
