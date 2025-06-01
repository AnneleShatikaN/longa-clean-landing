
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, PauseCircle, CheckCircle, XCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/utils/financialCalculations';
import { useToast } from '@/hooks/use-toast';

interface PendingPayout {
  id: string;
  providerId: number;
  providerName: string;
  amount: number;
  netAmount: number;
  taxesWithheld: number;
  paymentMethod: 'bank_transfer' | 'mobile_money';
  accountDetails: string;
  jobIds: number[];
  urgencyLevel: 'normal' | 'urgent' | 'emergency';
  createdAt: string;
  approved: boolean;
}

interface PayoutBatch {
  id: string;
  name: string;
  payouts: PendingPayout[];
  totalAmount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed';
  approvedBy?: string;
  processedAt?: string;
  failureReason?: string;
}

interface ProcessingStatus {
  isProcessing: boolean;
  currentPayout: string | null;
  progress: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}

export const PayoutProcessor = () => {
  const { toast } = useToast();
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    currentPayout: null,
    progress: 0,
    successCount: 0,
    failureCount: 0,
    errors: []
  });
  
  const [batchName, setBatchName] = useState('');
  const [autoRetry, setAutoRetry] = useState(true);
  const [maxRetries, setMaxRetries] = useState(3);

  // Mock pending payouts - in real implementation, this would come from API
  const pendingPayouts: PendingPayout[] = [
    {
      id: '1',
      providerId: 1,
      providerName: 'John Cleaning Services',
      amount: 1250,
      netAmount: 875,
      taxesWithheld: 375,
      paymentMethod: 'bank_transfer',
      accountDetails: 'FNB - ****5678',
      jobIds: [101, 102, 103],
      urgencyLevel: 'normal',
      createdAt: '2024-05-28',
      approved: true
    },
    {
      id: '2',
      providerId: 2,
      providerName: "Maria's Home Care",
      amount: 980,
      netAmount: 686,
      taxesWithheld: 294,
      paymentMethod: 'mobile_money',
      accountDetails: 'MTC - +264 81 234 5678',
      jobIds: [104, 105],
      urgencyLevel: 'urgent',
      createdAt: '2024-05-28',
      approved: false
    }
  ];

  const [batches, setBatches] = useState<PayoutBatch[]>([
    {
      id: 'batch-1',
      name: 'Weekly Payout - May 28, 2024',
      payouts: pendingPayouts.slice(0, 1),
      totalAmount: 875,
      status: 'completed',
      approvedBy: 'Admin User',
      processedAt: '2024-05-28T10:30:00Z'
    }
  ]);

  const togglePayoutSelection = (payoutId: string) => {
    setSelectedPayouts(prev => 
      prev.includes(payoutId) 
        ? prev.filter(id => id !== payoutId)
        : [...prev, payoutId]
    );
  };

  const selectAllPayouts = () => {
    const approvedPayouts = pendingPayouts.filter(p => p.approved).map(p => p.id);
    setSelectedPayouts(approvedPayouts);
  };

  const createBatch = () => {
    if (selectedPayouts.length === 0) {
      toast({
        title: "No Payouts Selected",
        description: "Please select at least one approved payout to create a batch.",
        variant: "destructive"
      });
      return;
    }

    if (!batchName) {
      toast({
        title: "Batch Name Required",
        description: "Please enter a name for this payout batch.",
        variant: "destructive"
      });
      return;
    }

    const selectedPayoutData = pendingPayouts.filter(p => selectedPayouts.includes(p.id));
    const totalAmount = selectedPayoutData.reduce((sum, p) => sum + p.netAmount, 0);

    const newBatch: PayoutBatch = {
      id: `batch-${Date.now()}`,
      name: batchName,
      payouts: selectedPayoutData,
      totalAmount,
      status: 'draft'
    };

    setBatches(prev => [newBatch, ...prev]);
    setSelectedPayouts([]);
    setBatchName('');

    toast({
      title: "Batch Created",
      description: `Payout batch "${batchName}" created with ${selectedPayoutData.length} payouts.`
    });
  };

  const processBatch = async (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    setProcessingStatus({
      isProcessing: true,
      currentPayout: null,
      progress: 0,
      successCount: 0,
      failureCount: 0,
      errors: []
    });

    // Update batch status
    setBatches(prev => prev.map(b => 
      b.id === batchId ? { ...b, status: 'processing' } : b
    ));

    // Simulate processing each payout
    for (let i = 0; i < batch.payouts.length; i++) {
      const payout = batch.payouts[i];
      
      setProcessingStatus(prev => ({
        ...prev,
        currentPayout: payout.providerName,
        progress: ((i + 1) / batch.payouts.length) * 100
      }));

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        setProcessingStatus(prev => ({
          ...prev,
          successCount: prev.successCount + 1
        }));
      } else {
        setProcessingStatus(prev => ({
          ...prev,
          failureCount: prev.failureCount + 1,
          errors: [...prev.errors, `Failed to process payout for ${payout.providerName}: Network timeout`]
        }));
      }
    }

    // Finalize processing
    const finalStatus = processingStatus.failureCount === 0 ? 'completed' : 'failed';
    
    setBatches(prev => prev.map(b => 
      b.id === batchId ? { 
        ...b, 
        status: finalStatus,
        processedAt: new Date().toISOString(),
        failureReason: processingStatus.failureCount > 0 ? `${processingStatus.failureCount} payouts failed` : undefined
      } : b
    ));

    setProcessingStatus(prev => ({ ...prev, isProcessing: false, currentPayout: null }));

    toast({
      title: "Batch Processing Complete",
      description: `${processingStatus.successCount} payouts successful, ${processingStatus.failureCount} failed.`,
      variant: processingStatus.failureCount > 0 ? "destructive" : "default"
    });
  };

  const retryFailedPayouts = async (batchId: string) => {
    // Implementation for retrying failed payouts
    toast({
      title: "Retrying Failed Payouts",
      description: "Processing failed payouts with retry logic..."
    });
  };

  const urgencyColor = (level: string) => {
    switch (level) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Batch Creation */}
      <Card>
        <CardHeader>
          <CardTitle>Create Payout Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="batchName">Batch Name</Label>
                <Input
                  id="batchName"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="Weekly Payout - May 28, 2024"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="autoRetry"
                  checked={autoRetry}
                  onCheckedChange={(checked) => setAutoRetry(checked === true)}
                />
                <Label htmlFor="autoRetry">Auto-retry failed payments</Label>
              </div>
              
              <div>
                <Label htmlFor="maxRetries">Max Retries</Label>
                <Select value={maxRetries.toString()} onValueChange={(value) => setMaxRetries(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 retry</SelectItem>
                    <SelectItem value="3">3 retries</SelectItem>
                    <SelectItem value="5">5 retries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={selectAllPayouts}>Select All Approved</Button>
              <Button onClick={createBatch} disabled={selectedPayouts.length === 0}>
                Create Batch ({selectedPayouts.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Status */}
      {processingStatus.isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Processing Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(processingStatus.progress)}%</span>
                </div>
                <Progress value={processingStatus.progress} />
              </div>
              
              {processingStatus.currentPayout && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Currently processing: {processingStatus.currentPayout}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{processingStatus.successCount}</div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{processingStatus.failureCount}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{processingStatus.successCount + processingStatus.failureCount}</div>
                  <div className="text-sm text-gray-600">Total Processed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Payouts */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingPayouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedPayouts.includes(payout.id)}
                    onCheckedChange={() => togglePayoutSelection(payout.id)}
                    disabled={!payout.approved}
                  />
                  <div>
                    <h4 className="font-medium">{payout.providerName}</h4>
                    <p className="text-sm text-gray-600">
                      {payout.accountDetails} • {payout.jobIds.length} jobs
                    </p>
                    <div className="flex space-x-2 mt-1">
                      <Badge className={urgencyColor(payout.urgencyLevel)}>
                        {payout.urgencyLevel}
                      </Badge>
                      <Badge variant={payout.approved ? "default" : "secondary"}>
                        {payout.approved ? "Approved" : "Pending Approval"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(payout.netAmount)}</div>
                  <div className="text-sm text-gray-600">
                    Gross: {formatCurrency(payout.amount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Tax: {formatCurrency(payout.taxesWithheld)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payout Batches */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {batches.map((batch) => (
              <div key={batch.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{batch.name}</h4>
                    <p className="text-sm text-gray-600">
                      {batch.payouts.length} payouts • {formatCurrency(batch.totalAmount)} total
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={statusColor(batch.status)}>
                      {batch.status.replace('_', ' ')}
                    </Badge>
                    {batch.status === 'draft' && (
                      <Button size="sm" onClick={() => processBatch(batch.id)}>
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Process
                      </Button>
                    )}
                    {batch.status === 'failed' && (
                      <Button size="sm" variant="outline" onClick={() => retryFailedPayouts(batch.id)}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
                
                {batch.status === 'completed' && batch.processedAt && (
                  <p className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed on {new Date(batch.processedAt).toLocaleString()}
                  </p>
                )}
                
                {batch.status === 'failed' && batch.failureReason && (
                  <p className="text-sm text-red-600 flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    {batch.failureReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
