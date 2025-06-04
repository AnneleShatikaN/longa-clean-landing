
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  type: 'bank_transfer' | 'mobile_money' | 'cash';
  name: string;
  status: 'active' | 'inactive' | 'error';
  apiKey?: string;
  isConfigured: boolean;
}

export const BankingIntegration = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'bank_transfer',
      name: 'Standard Bank API',
      status: 'active',
      isConfigured: true
    },
    {
      id: '2', 
      type: 'mobile_money',
      name: 'MTC Mobile Money',
      status: 'active',
      isConfigured: true
    },
    {
      id: '3',
      type: 'mobile_money', 
      name: 'Telecom Mobile Money',
      status: 'inactive',
      isConfigured: false
    }
  ]);

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

  const handleToggleMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === id 
        ? { ...method, status: method.status === 'active' ? 'inactive' : 'active' }
        : method
    ));

    toast({
      title: "Payment Method Updated",
      description: "Payment method status has been updated.",
    });
  };

  const handleTestConnection = async (id: string) => {
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Connection Test",
      description: "API connection test completed successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bank Transfers</p>
                <p className="text-2xl font-bold">1</p>
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
                <p className="text-2xl font-bold">2</p>
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
                <p className="text-2xl font-bold">0</p>
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
          {paymentMethods.map((method) => (
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
                    onCheckedChange={() => handleToggleMethod(method.id)}
                  />
                </div>
              </div>

              {method.isConfigured ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">API Endpoint</Label>
                    <Input 
                      value={`https://api.${method.name.toLowerCase().replace(' ', '')}.com/v1`}
                      disabled 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">API Key</Label>
                    <Input 
                      type="password"
                      value="•••••••••••••••••••••••••"
                      disabled 
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">This payment method is not configured yet.</p>
                  <Button size="sm" variant="outline">
                    Configure Now
                  </Button>
                </div>
              )}

              <Separator className="my-4" />
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Last tested: {method.isConfigured ? '2 hours ago' : 'Never'}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleTestConnection(method.id)}
                  disabled={!method.isConfigured}
                >
                  Test Connection
                </Button>
              </div>
            </div>
          ))}
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
