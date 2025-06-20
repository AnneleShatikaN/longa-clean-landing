
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, CheckCircle, XCircle, Eye, User, Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProviderVerification {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  current_work_location: string;
  verification_status: string;
  verification_submitted_at: string;
  verification_documents: any;
  verification_notes: string;
  created_at: string;
  rating: number;
  total_jobs: number;
}

export const ProviderVerificationManagement = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<ProviderVerification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderVerification | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'provider')
        .in('verification_status', ['pending', 'submitted'])
        .order('verification_submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching providers:', error);
        setProviders([]);
      } else {
        setProviders(data || []);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationAction = async (providerId: string, action: 'approved' | 'rejected') => {
    try {
      setIsProcessing(true);

      const { error } = await supabase
        .from('users')
        .update({
          verification_status: action,
          verified_at: action === 'approved' ? new Date().toISOString() : null,
          verification_notes: verificationNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', providerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Provider verification ${action} successfully`,
      });

      // Refresh the list
      fetchProviders();
      setSelectedProvider(null);
      setVerificationNotes('');
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Provider Verification Management</h2>
        <p className="text-gray-600">Review and approve provider verification requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{providers.filter(p => p.verification_status === 'pending').length}</p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{providers.filter(p => p.verification_status === 'submitted').length}</p>
                <p className="text-sm text-gray-600">Documents Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{providers.length}</p>
                <p className="text-sm text-gray-600">Total Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : providers.length === 0 ? (
            <p className="text-gray-500">No pending verifications</p>
          ) : (
            <div className="space-y-4">
              {providers.map((provider) => (
                <div key={provider.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-lg">{provider.full_name}</h3>
                        <Badge className={getStatusColor(provider.verification_status)}>
                          {provider.verification_status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{provider.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{provider.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{provider.current_work_location || 'Not specified'}</span>
                        </div>
                        <div>
                          <span>Submitted: {provider.verification_submitted_at ? new Date(provider.verification_submitted_at).toLocaleDateString() : 'Not submitted'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedProvider(provider);
                              setVerificationNotes(provider.verification_notes || '');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Provider Verification Review</DialogTitle>
                          </DialogHeader>
                          
                          {selectedProvider && (
                            <div className="space-y-6">
                              {/* Provider Details */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="font-medium">Full Name</label>
                                  <p className="text-gray-600">{selectedProvider.full_name}</p>
                                </div>
                                <div>
                                  <label className="font-medium">Email</label>
                                  <p className="text-gray-600">{selectedProvider.email}</p>
                                </div>
                                <div>
                                  <label className="font-medium">Phone</label>
                                  <p className="text-gray-600">{selectedProvider.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                  <label className="font-medium">Location</label>
                                  <p className="text-gray-600">{selectedProvider.current_work_location || 'Not specified'}</p>
                                </div>
                                <div>
                                  <label className="font-medium">Rating</label>
                                  <p className="text-gray-600">{selectedProvider.rating}/5</p>
                                </div>
                                <div>
                                  <label className="font-medium">Total Jobs</label>
                                  <p className="text-gray-600">{selectedProvider.total_jobs}</p>
                                </div>
                              </div>

                              {/* Documents Section */}
                              <div>
                                <label className="font-medium mb-2 block">Submitted Documents</label>
                                {selectedProvider.verification_documents && Object.keys(selectedProvider.verification_documents).length > 0 ? (
                                  <div className="space-y-2">
                                    {Object.entries(selectedProvider.verification_documents).map(([key, value]) => (
                                      <div key={key} className="flex justify-between items-center p-2 border rounded">
                                        <span className="capitalize">{key.replace('_', ' ')}</span>
                                        <span className="text-sm text-gray-600">{value ? 'Submitted' : 'Not provided'}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-500">No documents submitted yet</p>
                                )}
                              </div>

                              {/* Notes */}
                              <div>
                                <label className="font-medium mb-2 block">Verification Notes</label>
                                <Textarea
                                  value={verificationNotes}
                                  onChange={(e) => setVerificationNotes(e.target.value)}
                                  placeholder="Add notes about the verification process..."
                                  rows={3}
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex space-x-3 pt-4">
                                <Button
                                  onClick={() => handleVerificationAction(selectedProvider.id, 'approved')}
                                  disabled={isProcessing}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleVerificationAction(selectedProvider.id, 'rejected')}
                                  disabled={isProcessing}
                                  variant="destructive"
                                  className="flex-1"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
