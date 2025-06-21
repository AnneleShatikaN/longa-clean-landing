
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  FileText, 
  Eye, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProviderApprovalActions from './ProviderApprovalActions';

interface ProviderApplication {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  verification_status: string;
  verification_submitted_at: string;
  verification_notes?: string;
  current_work_location?: string;
  service_coverage_areas?: string[];
  documents: ProviderDocument[];
  banking_details?: BankingDetails;
}

interface ProviderDocument {
  id: string;
  document_type: string;
  document_name: string;
  file_path: string;
  mime_type: string;
  uploaded_at: string;
  verification_status: string;
}

interface BankingDetails {
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  branch_code?: string;
}

export const ProviderVerificationManagement: React.FC = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ProviderApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      
      // Fetch providers with verification status
      const { data: providers, error: providersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'provider')
        .in('verification_status', ['under_review', 'verified', 'rejected'])
        .order('verification_submitted_at', { ascending: false });

      if (providersError) throw providersError;

      // Fetch documents and banking details for each provider
      const applicationsWithDetails = await Promise.all(
        (providers || []).map(async (provider) => {
          // Fetch documents
          const { data: documents, error: docsError } = await supabase
            .from('provider_documents')
            .select('*')
            .eq('provider_id', provider.id);

          if (docsError) console.error('Error fetching documents:', docsError);

          // Fetch banking details
          const { data: banking, error: bankingError } = await supabase
            .from('provider_banking_details')
            .select('*')
            .eq('provider_id', provider.id)
            .single();

          if (bankingError && bankingError.code !== 'PGRST116') {
            console.error('Error fetching banking details:', bankingError);
          }

          return {
            ...provider,
            documents: documents || [],
            banking_details: banking
          };
        })
      );

      setApplications(applicationsWithDetails);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load verification applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleViewDocument = async (document: ProviderDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('verification-documents')
        .createSignedUrl(document.file_path, 60);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: "Error",
        description: "Failed to view document",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'under_review':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Under Review</Badge>;
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Provider Verification Management</h2>
        <Button onClick={fetchApplications} variant="outline">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="under_review" className="space-y-4">
        <TabsList>
          <TabsTrigger value="under_review">
            Under Review ({applications.filter(app => app.verification_status === 'under_review').length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({applications.filter(app => app.verification_status === 'verified').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({applications.filter(app => app.verification_status === 'rejected').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="under_review">
          <div className="grid gap-4">
            {applications
              .filter(app => app.verification_status === 'under_review')
              .map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">{application.full_name}</CardTitle>
                          <p className="text-sm text-gray-600">{application.email}</p>
                        </div>
                      </div>
                      {getStatusBadge(application.verification_status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Basic Info */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Contact Information</h4>
                        {application.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4" />
                            {application.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4" />
                          {application.email}
                        </div>
                        {application.current_work_location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            {application.current_work_location}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          Applied: {formatDate(application.verification_submitted_at)}
                        </div>
                      </div>

                      {/* Documents */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Documents ({application.documents.length})</h4>
                        {application.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">{doc.document_type.replace('_', ' ')}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDocument(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Banking Details */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Banking Details</h4>
                        {application.banking_details ? (
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              {application.banking_details.bank_name}
                            </div>
                            <div className="text-gray-600">
                              {application.banking_details.account_holder_name}
                            </div>
                            <div className="text-gray-600">
                              {application.banking_details.account_number.replace(/\d(?=\d{4})/g, '*')}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No banking details provided</p>
                        )}
                      </div>
                    </div>

                    {/* Approval Actions */}
                    <ProviderApprovalActions
                      providerId={application.id}
                      currentStatus={application.verification_status}
                      onStatusUpdate={fetchApplications}
                    />
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="verified">
          <div className="grid gap-4">
            {applications
              .filter(app => app.verification_status === 'verified')
              .map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">{application.full_name}</h3>
                          <p className="text-sm text-gray-600">{application.email}</p>
                        </div>
                      </div>
                      {getStatusBadge(application.verification_status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="grid gap-4">
            {applications
              .filter(app => app.verification_status === 'rejected')
              .map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">{application.full_name}</h3>
                          <p className="text-sm text-gray-600">{application.email}</p>
                          {application.verification_notes && (
                            <p className="text-sm text-red-600 mt-1">
                              Reason: {application.verification_notes}
                            </p>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(application.verification_status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
