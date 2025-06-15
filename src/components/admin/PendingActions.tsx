
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Settings, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PendingActionsProps {
  data: any;
  isLoading: boolean;
  onRefresh: () => void;
}

interface PendingProvider {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  is_active: boolean;
}

export const PendingActions: React.FC<PendingActionsProps> = ({ data, isLoading, onRefresh }) => {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pendingProviders, setPendingProviders] = useState<PendingProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  // Fetch pending providers
  const fetchPendingProviders = async () => {
    setLoadingProviders(true);
    try {
      const { data: providers, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'provider')
        .eq('is_active', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPendingProviders(providers || []);
    } catch (error) {
      console.error('Error fetching pending providers:', error);
    } finally {
      setLoadingProviders(false);
    }
  };

  useEffect(() => {
    fetchPendingProviders();
  }, []);

  const handleApproveProvider = async (providerId: string, providerName: string) => {
    setProcessingId(providerId);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', providerId);

      if (error) throw error;

      toast({
        title: "Provider Approved",
        description: `${providerName} has been approved successfully.`,
      });

      // Refresh the data
      await fetchPendingProviders();
      onRefresh();
    } catch (error) {
      console.error('Error approving provider:', error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve the provider. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectProvider = async (providerId: string, providerName: string) => {
    setProcessingId(providerId);
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', providerId);

      if (error) throw error;

      toast({
        title: "Provider Rejected",
        description: `${providerName} has been rejected and removed from the system.`,
      });

      // Refresh the data
      await fetchPendingProviders();
      onRefresh();
    } catch (error) {
      console.error('Error rejecting provider:', error);
      toast({
        title: "Rejection Failed",
        description: "Failed to reject the provider. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPendingPayments = () => {
    return data?.payouts?.filter((payout: any) => payout.status === 'pending')?.length || 0;
  };

  if (isLoading || loadingProviders) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingPayments = getPendingPayments();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Pending Actions
          <Button variant="outline" size="sm" onClick={() => {
            fetchPendingProviders();
            onRefresh();
          }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Provider Verification */}
          {pendingProviders.length > 0 && pendingProviders.map((provider) => (
            <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg border-yellow-200 bg-yellow-50">
              <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 bg-yellow-100 p-2 rounded-full text-yellow-600" />
                <div>
                  <p className="font-medium">Provider Verification</p>
                  <p className="text-sm text-gray-600">
                    {provider.full_name} ({provider.email}) • Applied {formatDate(provider.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      disabled={processingId === provider.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Provider</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve {provider.full_name} as a service provider? 
                        They will be able to accept bookings once approved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleApproveProvider(provider.id, provider.full_name)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={processingId === provider.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Provider</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject {provider.full_name}'s application? 
                        This will permanently remove them from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleRejectProvider(provider.id, provider.full_name)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          
          {/* Failed Payments */}
          {pendingPayments > 0 && (
            <div className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 bg-red-100 p-2 rounded-full text-red-600" />
                <div>
                  <p className="font-medium">Pending Payments</p>
                  <p className="text-sm text-gray-600">{pendingPayments} payment(s) need attention</p>
                </div>
              </div>
              <Button size="sm" variant="destructive">Fix</Button>
            </div>
          )}

          {/* Empty state */}
          {pendingProviders.length === 0 && pendingPayments === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-500">No pending actions at the moment</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
