
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, 
  HelpCircle, 
  FileText, 
  MessageSquare, 
  Phone, 
  Mail,
  ExternalLink,
  ChevronDown,
  Download
} from 'lucide-react';
import { useSupportData } from '@/hooks/useSupportData';
import { useSupportContacts } from '@/hooks/useSupportContacts';

export const HelpSupportPage: React.FC = () => {
  const { faqs, docLinks, isLoading, incrementFAQViews } = useSupportData();
  const { contacts } = useSupportContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqCategories = ['Payments', 'Bookings', 'Accounts', 'Technical', 'General'];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFAQClick = (faqId: string) => {
    incrementFAQViews(faqId);
  };

  const getDocsByCategory = (category: string) => {
    return docLinks.filter(doc => doc.category === category);
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

  const supportContacts = contacts.filter(contact => 
    !contact.is_emergency && contact.contact_type !== 'live_chat'
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Help & Support</h1>
        <p className="text-gray-600">Find answers to common questions or get in touch with our support team</p>
      </div>

      <Tabs defaultValue="faqs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">FAQs</span>
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documentation</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faqs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </Button>
                  {faqCategories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading FAQs...</p>
                </div>
              ) : filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                      <AccordionTrigger 
                        className="text-left hover:no-underline"
                        onClick={() => handleFAQClick(faq.id)}
                      >
                        <div className="flex items-center justify-between w-full mr-4">
                          <span className="font-medium">{faq.question}</span>
                          <Badge variant="outline" className="ml-2">
                            {faq.category}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-0">
                        <div className="text-gray-600 whitespace-pre-wrap">
                          {faq.answer}
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-2 border-t text-xs text-gray-500">
                          <span>{faq.views} views</span>
                          <span>Last updated: {new Date(faq.updated_at).toLocaleDateString()}</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No FAQs found matching your search.</p>
                  <p className="text-sm">Try different keywords or browse all categories.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['User Guides', 'Video Tutorials', 'API Documentation', 'Getting Started'].map(category => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getDocsByCategory(category).map((doc) => (
                      <div key={doc.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div 
                          className="flex items-start gap-3"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          {getDocIcon(doc.file_type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1 line-clamp-2">
                              {doc.title}
                            </h4>
                            {doc.description && (
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {doc.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <ExternalLink className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">Click to view</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {getDocsByCategory(category).length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No documents available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <p className="text-sm text-gray-600">
                  Get in touch with our support team for personalized assistance
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportContacts.map((contact) => (
                  <div key={contact.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      {contact.contact_type === 'email' ? (
                        <Mail className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Phone className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <h4 className="font-medium">{contact.display_name}</h4>
                        <p className="text-sm text-gray-600">{contact.description}</p>
                      </div>
                    </div>
                    <div className="ml-8">
                      <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">
                        {contact.contact_value}
                      </p>
                      {contact.availability_hours && (
                        <p className="text-xs text-gray-500 mt-1">
                          Available: {contact.availability_hours}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <p className="text-sm text-gray-600">
                  Common support actions and resources
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <MessageSquare className="h-4 w-4 mr-3" />
                  Start Live Chat
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <FileText className="h-4 w-4 mr-3" />
                  Submit Support Ticket
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Download className="h-4 w-4 mr-3" />
                  Download Mobile App
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Report an Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
