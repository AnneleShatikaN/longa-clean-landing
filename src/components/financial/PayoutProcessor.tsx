
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, AlertCircle, Play, Pause, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayoutBatch {
  id: string;
  name: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed';
  totalAmount: number;
  payoutCount: number;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
}

export const PayoutProcessor = () => {
  const { toast } = useToast();
  const [batches, setBatches] = useState<PayoutBatch[]>([
    {
      id: '1',
      name: 'Weekly Batch #2024-23',
      status: 'approved',
      totalAmount: 25650,
      payoutCount: 45,
      createdAt: '2024-06-01'
    },
    {
      id: '2', 
      name: 'Emergency Payouts',
      status: 'processing',
      totalAmount: 1200,
      payoutCount: 3,
      createdAt: '2024-06-01'
    }
  ]);
  
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

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
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Simulate processing with progress updates
      for (let i = 0; i <= 100; i += 10) {
        setProcessingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'completed', processedAt: new Date().toISOString().split('T')[0] }
          : batch
      ));

      toast({
        title: "Batch Processed Successfully",
        description: "All payouts in the batch have been processed.",
      });
    } catch (error) {
      setBatches(prev => prev.map(batch => 
        batch.id === batchId 
          ? { ...batch, status: 'failed', failureReason: 'Network connection failed' }
          : batch
      ));

      toast({
        title: "Processing Failed",
        description: "Batch processing failed. Please retry.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleRetryBatch = async (batchId: string) => {
    setBatches(prev => prev.map(batch => 
      batch.id === batchId 
        ? { ...batch, status: 'approved', failureReason: undefined }
        : batch
    ));
    
    toast({
      title: "Batch Reset",
      description: "Batch is ready for retry processing.",
    });
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
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(batch.status)}
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{batch.payoutCount}</TableCell>
                  <TableCell className="font-medium">N${batch.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{batch.createdAt}</TableCell>
                  <TableCell>{batch.processedAt || '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {batch.status === 'approved' && (
                        <Button 
                          size="sm"
                          onClick={() => handleProcessBatch(batch.id)}
                          disabled={isProcessing}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Process
                        </Button>
                      )}
                      {batch.status === 'failed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRetryBatch(batch.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      )}
                      {batch.status === 'processing' && (
                        <Button size="sm" variant="outline" disabled>
                          <Pause className="h-3 w-3 mr-1" />
                          Processing...
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col gap-2">
              <Play className="h-6 w-6" />
              Create New Batch
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <AlertCircle className="h-6 w-6" />
              Process Emergency Payouts
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <RefreshCw className="h-6 w-6" />
              Retry Failed Batches
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
