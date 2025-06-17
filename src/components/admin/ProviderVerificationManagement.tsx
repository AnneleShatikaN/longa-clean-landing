
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Eye, Check, X, Clock, FileText, CreditCard, Users, AlertCircle } from 'lucide-react';
import { VerificationStatusBadge } from '../provider/VerificationStatusBadge';

interface ProviderVerification {
  id: string;
  full_name: string;
  email: string;
  verification_status: string;
  verification_submitted_at: string;
  verified_at?: string;
  verification_notes?: string;
  documents: any[];
  banking_details: any[];
  references: any[];
}

export const ProviderVerificationManagement: React.FC = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<ProviderVerification[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderVerification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    setIsLoading(true);
    try {
      // Fetch providers with verification data
      const { data: providersData, error: providersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'provider')
        .in('verification_status', ['pending', 'under_review', 'rejected'])
        .order('verification_submitted_at', { ascending: false });

      if (providersError) throw providersError;

      // Fetch documents, banking details, and references for each provider
      const providersWithDetails = await Promise.all(
        (providersData || []).map(async (provider) => {
          const [documentsRes, bankingRes, referencesRes] = await Promise.all([
            supabase.from('provider_documents').select('*').eq('provider_id', provider.id),
            supabase.from('provider_banking_details').select('*').eq('provider_id', provider.id),
            supabase.from('provider_references').select('*').eq('provider_id', provider.id)
          ]);

          return {
            ...provider,
            documents: documentsRes.data || [],
            banking_details: bankingRes.data || [],
            references: referencesRes.data || []
          };
        })
      );

      setProviders(providersWithDetails);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending verifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (providerId: string, newStatus: string) => {
    try {
      const { data, error } = await supabase.rpc('update_provider_verification_status', {
        provider_id: providerId,
        new_status: newStatus,
        admin_notes: adminNotes
      });

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Provider verification status updated to ${newStatus}`,
      });

      // Refresh the list
      await fetchPendingVerifications();
      setShowDetailsModal(false);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  const viewProviderDetails = (provider: ProviderVerification) => {
    setSelectedProvider(provider);
    setAdminNotes(provider.verification_notes || '');
    setShowDetailsModal(true);
  };

  const downloadDocument = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('verification-documents')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading pending verifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Provider Verification Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Verifications</h3>
              <p className="text-gray-600">All providers are currently verified or no applications pending.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {providers.map((provider) => (
                <Card key={provider.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{provider.full_name}</h4>
                          <VerificationStatusBadge status={provider.verification_status} size="sm" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{provider.email}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Submitted: {new Date(provider.verification_submitted_at).toLocaleDateString()}</span>
                          <span>Documents: {provider.documents.length}</span>
                          <span>References: {provider.references.length}</span>
                          <span>Banking: {provider.banking_details.length > 0 ? 'Complete' : 'Missing'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewProviderDetails(provider)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Provider Verification Review: {selectedProvider?.full_name}
            </DialogTitle>
          </DialogHeader>

          {selectedProvider && (
            <Tabs defaultValue="documents" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="banking">Banking</TabsTrigger>
                <TabsTrigger value="references">References</TabsTrigger>
                <TabsTrigger value="review">Final Review</TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Uploaded Documents ({selectedProvider.documents.length})
                </h3>
                {selectedProvider.documents.length === 0 ? (
                  <p className="text-gray-600">No documents uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {selectedProvider.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{doc.document_name}</p>
                          <p className="text-sm text-gray-600 capitalize">{doc.document_type}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(doc.file_path, doc.document_name)}
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="banking" className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Banking Details
                </h3>
                {selectedProvider.banking_details.length === 0 ? (
                  <p className="text-gray-600">No banking details provided</p>
                ) : (
                  <div className="space-y-2">
                    {selectedProvider.banking_details.map((banking) => (
                      <div key={banking.id} className="p-4 border rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Bank:</span> {banking.bank_name}
                          </div>
                          <div>
                            <span className="font-medium">Account Holder:</span> {banking.account_holder_name}
                          </div>
                          <div>
                            <span className="font-medium">Account Number:</span> ****{banking.account_number.slice(-4)}
                          </div>
                          <div>
                            <span className="font-medium">Account Type:</span> {banking.account_type}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="references" className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Professional References ({selectedProvider.references.length})
                </h3>
                {selectedProvider.references.length === 0 ? (
                  <p className="text-gray-600">No references provided</p>
                ) : (
                  <div className="space-y-3">
                    {selectedProvider.references.map((ref, index) => (
                      <div key={ref.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Reference {index + 1}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Name:</span> {ref.reference_name}
                          </div>
                          <div>
                            <span className="font-medium">Phone:</span> {ref.reference_phone}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {ref.reference_email || 'Not provided'}
                          </div>
                          <div>
                            <span className="font-medium">Relationship:</span> {ref.relationship}
                          </div>
                          <div>
                            <span className="font-medium">Company:</span> {ref.company_name || 'Not provided'}
                          </div>
                          <div>
                            <span className="font-medium">Years Known:</span> {ref.years_known || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="review" className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Final Review & Decision
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Admin Notes</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about the verification review..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleStatusUpdate(selectedProvider.id, 'verified')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve & Verify
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(selectedProvider.id, 'rejected')}
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate(selectedProvider.id, 'under_review')}
                      variant="outline"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Mark Under Review
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
