
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, AlertCircle, Play, Pause, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PayoutBatch {
  id: string;
  batch_name: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed';
  total_amount: number;
  payout_count: number;
  created_at: string;
  processed_at?: string;
  failure_reason?: string;
}

export const PayoutProcessor = () => {
  const { toast } = useToast();
  const [batches, setBatches] = useState<PayoutBatch[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBatchIds, setProcessingBatchIds] = useState<Set<string>>(new Set());

  // Fetch payout batches from Supabase
  const fetchPayoutBatches = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payout_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching payout batches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payout batches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutBatches();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'approved': return <Play className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProcessBatch = async (batchId: string) => {
    const processingSet = new Set(processingBatchIds);
    processingSet.add(batchId);
    setProcessingBatchIds(processingSet);
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Update batch status to processing
      const { error: updateError } = await supabase
        .from('payout_batches')
        .update({ 
          status: 'processing',
          processed_at: new Date().toISOString()
        })
        .eq('id', batchId);

      if (updateError) throw updateError;

      // Simulate processing with progress updates
      for (let i = 0; i <= 100; i += 10) {
        setProcessingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Complete the batch
      const { error: completeError } = await supabase
        .from('payout_batches')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', batchId);

      if (completeError) throw completeError;

      // Update local state
      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'completed', processed_at: new Date().toISOString() }
          : batch
      ));

      toast({
        title: "Batch Processed Successfully",
        description: "All payouts in the batch have been processed.",
        className: "border-green-200 bg-green-50",
      });
    } catch (error) {
      console.error('Error processing batch:', error);
      
      // Update batch status to failed
      await supabase
        .from('payout_batches')
        .update({ 
          status: 'failed',
          failure_reason: 'Processing failed due to system error'
        })
        .eq('id', batchId);

      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'failed', failure_reason: 'Processing failed due to system error' }
          : batch
      ));

      toast({
        title: "Processing Failed",
        description: "Batch processing failed. Please retry.",
        variant: "destructive",
      });
    } finally {
      const processingSet = new Set(processingBatchIds);
      processingSet.delete(batchId);
      setProcessingBatchIds(processingSet);
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handlePauseBatch = async (batchId: string) => {
    try {
      const { error } = await supabase
        .from('payout_batches')
        .update({ status: 'draft' })
        .eq('id', batchId);

      if (error) throw error;

      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'draft' }
          : batch
      ));

      toast({
        title: "Batch Paused",
        description: "Batch processing has been paused.",
        className: "border-yellow-200 bg-yellow-50",
      });
    } catch (error) {
      console.error('Error pausing batch:', error);
      toast({
        title: "Error",
        description: "Failed to pause batch. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetryBatch = async (batchId: string) => {
    try {
      const { error } = await supabase
        .from('payout_batches')
        .update({ 
          status: 'approved',
          failure_reason: null
        })
        .eq('id', batchId);

      if (error) throw error;

      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'approved', failure_reason: undefined }
          : batch
      ));
      
      toast({
        title: "Batch Reset",
        description: "Batch is ready for retry processing.",
        className: "border-blue-200 bg-blue-50",
      });
    } catch (error) {
      console.error('Error retrying batch:', error);
      toast({
        title: "Error",
        description: "Failed to reset batch. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelBatch = async (batchId: string) => {
    try {
      const { error } = await supabase
        .from('payout_batches')
        .update({ 
          status: 'failed',
          failure_reason: 'Cancelled by admin'
        })
        .eq('id', batchId);

      if (error) throw error;

      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'failed', failure_reason: 'Cancelled by admin' }
          : batch
      ));

      toast({
        title: "Batch Cancelled",
        description: "Batch has been cancelled.",
        className: "border-red-200 bg-red-50",
      });
    } catch (error) {
      console.error('Error cancelling batch:', error);
      toast({
        title: "Error",
        description: "Failed to cancel batch. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Processing Status */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Processing Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isProcessing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing payouts...</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
            </div>
          ) : (
            <p className="text-gray-600">No active processing</p>
          )}
        </CardContent>
      </Card>

      {/* Batch Management */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Batches</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading batches...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payout Count</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{batch.batch_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(batch.status)}
                        <Badge className={getStatusColor(batch.status)}>
                          {batch.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{batch.payout_count}</TableCell>
                    <TableCell className="font-medium">N${batch.total_amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(batch.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{batch.processed_at ? new Date(batch.processed_at).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {batch.status === 'approved' && (
                          <Button 
                            size="sm"
                            onClick={() => handleProcessBatch(batch.id)}
                            disabled={processingBatchIds.has(batch.id)}
                            className={cn(
                              "transition-all duration-200 hover:bg-green-600 hover:scale-105 active:scale-95",
                              processingBatchIds.has(batch.id) && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {processingBatchIds.has(batch.id) ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3 mr-1" />
                            )}
                            Process
                          </Button>
                        )}
                        {batch.status === 'processing' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePauseBatch(batch.id)}
                              className="hover:bg-yellow-50 transition-colors"
                            >
                              <Pause className="h-3 w-3 mr-1" />
                              Pause
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleCancelBatch(batch.id)}
                              className="hover:bg-red-600 transition-colors"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {batch.status === 'failed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRetryBatch(batch.id)}
                            className="hover:bg-blue-50 transition-colors"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        )}
                        {batch.status === 'completed' && (
                          <Button size="sm" variant="outline" disabled className="opacity-50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && batches.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No payout batches found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col gap-2 hover:scale-105 transition-transform">
              <Play className="h-6 w-6" />
              Create New Batch
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:scale-105 transition-transform">
              <AlertCircle className="h-6 w-6" />
              Process Emergency Payouts
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 hover:scale-105 transition-transform">
              <RefreshCw className="h-6 w-6" />
              Retry Failed Batches
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
