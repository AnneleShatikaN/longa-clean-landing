
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, CreditCard, Smartphone, Banknote, Edit2, Save, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMethodConfig {
  id: string;
  name: string;
  type: 'bank_transfer' | 'mobile_money' | 'cash';
  api_endpoint?: string;
  status: 'active' | 'inactive' | 'error';
  is_configured: boolean;
  last_tested_at?: string;
  test_result?: any;
}

interface EditingState {
  [key: string]: {
    endpoint: string;
    apiKey: string;
  };
}

interface DatabasePaymentMethodConfig {
  id: string;
  name: string;
  type: string;
  api_endpoint: string | null;
  status: string;
  is_configured: boolean;
  last_tested_at: string | null;
  test_result: any;
  api_key_encrypted: string | null;
  created_at: string;
  updated_at: string;
}

interface FunctionResponse {
  success: boolean;
  message?: string;
  error?: string;
  response_time?: number;
}

export const BankingIntegration = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [editingMethods, setEditingMethods] = useState<string[]>([]);
  const [editingData, setEditingData] = useState<EditingState>({});
  const [testingMethods, setTestingMethods] = useState<string[]>([]);
  const [savingMethods, setSavingMethods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch payment methods from database
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_method_configs')
        .select('*')
        .order('created_at');

      if (error) throw error;

      // Transform database response to match our interface
      const transformedData: PaymentMethodConfig[] = (data || []).map((item: DatabasePaymentMethodConfig) => ({
        id: item.id,
        name: item.name,
        type: item.type as 'bank_transfer' | 'mobile_money' | 'cash',
        api_endpoint: item.api_endpoint || undefined,
        status: item.status as 'active' | 'inactive' | 'error',
        is_configured: item.is_configured,
        last_tested_at: item.last_tested_at || undefined,
        test_result: item.test_result
      }));

      setPaymentMethods(transformedData);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer': return <CreditCard className="h-5 w-5" />;
      case 'mobile_money': return <Smartphone className="h-5 w-5" />;
      default: return <Banknote className="h-5 w-5" />;
    }
  };

  const validateEndpoint = (endpoint: string): boolean => {
    return endpoint.startsWith('https://') && endpoint.length > 10;
  };

  const validateApiKey = (apiKey: string): boolean => {
    return apiKey.length >= 32;
  };

  const startEditing = (methodId: string, currentEndpoint?: string) => {
    setEditingMethods(prev => [...prev, methodId]);
    setEditingData(prev => ({
      ...prev,
      [methodId]: {
        endpoint: currentEndpoint || '',
        apiKey: ''
      }
    }));
  };

  const cancelEditing = (methodId: string) => {
    setEditingMethods(prev => prev.filter(id => id !== methodId));
    setEditingData(prev => {
      const newData = { ...prev };
      delete newData[methodId];
      return newData;
    });
  };

  const updateEditingData = (methodId: string, field: 'endpoint' | 'apiKey', value: string) => {
    setEditingData(prev => ({
      ...prev,
      [methodId]: {
        ...prev[methodId],
        [field]: value
      }
    }));
  };

  const saveConfiguration = async (methodId: string) => {
    const data = editingData[methodId];
    if (!data) return;

    // Validate inputs
    if (!validateEndpoint(data.endpoint)) {
      toast({
        title: "Invalid Endpoint",
        description: "Endpoint must start with https:// and be at least 10 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!validateApiKey(data.apiKey)) {
      toast({
        title: "Invalid API Key",
        description: "API key must be at least 32 characters long",
        variant: "destructive",
      });
      return;
    }

    setSavingMethods(prev => [...prev, methodId]);

    try {
      const { data: result, error } = await supabase.rpc('update_payment_method_config', {
        config_id: methodId,
        endpoint: data.endpoint,
        api_key: data.apiKey
      });

      if (error) throw error;

      const response = result as FunctionResponse;
      if (response?.success) {
        toast({
          title: "Configuration Saved",
          description: "Payment method configuration has been updated successfully",
        });
        
        // Refresh the data
        await fetchPaymentMethods();
        
        // Stop editing
        cancelEditing(methodId);
      } else {
        throw new Error(response?.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save configuration",
        variant: "destructive",
      });
    } finally {
      setSavingMethods(prev => prev.filter(id => id !== methodId));
    }
  };

  const handleToggleMethod = async (methodId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { data: result, error } = await supabase.rpc('update_payment_method_config', {
        config_id: methodId,
        new_status: newStatus
      });

      if (error) throw error;

      const response = result as FunctionResponse;
      if (response?.success) {
        toast({
          title: "Status Updated",
          description: `Payment method has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
        });
        
        await fetchPaymentMethods();
      } else {
        throw new Error(response?.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async (methodId: string) => {
    setTestingMethods(prev => [...prev, methodId]);

    try {
      const { data: result, error } = await supabase.rpc('test_payment_method_connection', {
        config_id: methodId
      });

      if (error) throw error;

      const response = result as FunctionResponse;
      if (response?.success) {
        toast({
          title: "Connection Test Successful",
          description: `API connection test completed successfully (${response.response_time}ms)`,
          className: "border-green-200 bg-green-50",
        });
      } else {
        toast({
          title: "Connection Test Failed",
          description: response?.error || "Failed to connect to API endpoint",
          variant: "destructive",
        });
      }
      
      // Refresh data to get updated test results
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Failed to test connection",
        variant: "destructive",
      });
    } finally {
      setTestingMethods(prev => prev.filter(id => id !== methodId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading payment methods...</span>
      </div>
    );
  }

  // Calculate stats dynamically
  const bankTransferCount = paymentMethods.filter(m => m.type === 'bank_transfer').length;
  const mobileMoneyCount = paymentMethods.filter(m => m.type === 'mobile_money').length;
  const cashCount = paymentMethods.filter(m => m.type === 'cash').length;

  return (
    <div className="space-y-6">
      {/* Payment Methods Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bank Transfers</p>
                <p className="text-2xl font-bold">{bankTransferCount}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mobile Money</p>
                <p className="text-2xl font-bold">{mobileMoneyCount}</p>
              </div>
              <Smartphone className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cash Payments</p>
                <p className="text-2xl font-bold">{cashCount}</p>
              </div>
              <Banknote className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentMethods.map((method) => {
            const isEditing = editingMethods.includes(method.id);
            const isTesting = testingMethods.includes(method.id);
            const isSaving = savingMethods.includes(method.id);
            const editData = editingData[method.id];

            return (
              <div key={method.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getMethodIcon(method.type)}
                    <div>
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{method.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(method.status)}
                      <Badge className={getStatusColor(method.status)}>
                        {method.status}
                      </Badge>
                    </div>
                    <Switch 
                      checked={method.status === 'active'}
                      onCheckedChange={() => handleToggleMethod(method.id, method.status)}
                    />
                  </div>
                </div>

                {method.is_configured && !isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">API Endpoint</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input 
                          value={method.api_endpoint || ''}
                          disabled 
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(method.id, method.api_endpoint)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">API Key</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input 
                          type="password"
                          value="•••••••••••••••••••••••••"
                          disabled 
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(method.id, method.api_endpoint)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">API Endpoint *</Label>
                      <Input 
                        placeholder="https://api.example.com/v1"
                        value={editData?.endpoint || ''}
                        onChange={(e) => updateEditingData(method.id, 'endpoint', e.target.value)}
                        className={`mt-1 ${editData?.endpoint && !validateEndpoint(editData.endpoint) ? 'border-red-500' : ''}`}
                      />
                      {editData?.endpoint && !validateEndpoint(editData.endpoint) && (
                        <p className="text-xs text-red-500 mt-1">Must start with https:// and be at least 10 characters</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm">API Key *</Label>
                      <Input 
                        type="password"
                        placeholder="Enter API key (min 32 characters)"
                        value={editData?.apiKey || ''}
                        onChange={(e) => updateEditingData(method.id, 'apiKey', e.target.value)}
                        className={`mt-1 ${editData?.apiKey && !validateApiKey(editData.apiKey) ? 'border-red-500' : ''}`}
                      />
                      {editData?.apiKey && !validateApiKey(editData.apiKey) && (
                        <p className="text-xs text-red-500 mt-1">API key must be at least 32 characters long</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">This payment method is not configured yet.</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => startEditing(method.id)}
                    >
                      Configure Now
                    </Button>
                  </div>
                )}

                {isEditing && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm"
                      onClick={() => saveConfiguration(method.id)}
                      disabled={isSaving || !editData?.endpoint || !editData?.apiKey || !validateEndpoint(editData.endpoint) || !validateApiKey(editData.apiKey)}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => cancelEditing(method.id)}
                      disabled={isSaving}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}

                <Separator className="my-4" />
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Last tested: {method.last_tested_at ? new Date(method.last_tested_at).toLocaleDateString() : 'Never'}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleTestConnection(method.id)}
                    disabled={!method.is_configured || isTesting || isEditing}
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeout">Request Timeout (seconds)</Label>
              <Input id="timeout" type="number" defaultValue="30" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="retries">Max Retry Attempts</Label>
              <Input id="retries" type="number" defaultValue="3" className="mt-1" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enable Webhook Notifications</Label>
              <p className="text-sm text-gray-600">Receive real-time payment status updates</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto-retry Failed Payments</Label>
              <p className="text-sm text-gray-600">Automatically retry failed payments</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
