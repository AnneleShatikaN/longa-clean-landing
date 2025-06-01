
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Shield, 
  Building, 
  DollarSign, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Download
} from 'lucide-react';

interface ComplianceItem {
  id: string;
  title: string;
  status: 'compliant' | 'pending' | 'non_compliant';
  description: string;
  dueDate?: string;
  actions: string[];
}

export const NamibianCompliance: React.FC = () => {
  const [businessRegistration, setBusinessRegistration] = useState({
    companyName: '',
    registrationNumber: '',
    vatNumber: '',
    businessType: 'sole_proprietorship'
  });

  const [taxCompliance, setTaxCompliance] = useState({
    taxNumber: '',
    vatRegistered: false,
    payeRegistered: false,
    lastTaxReturn: ''
  });

  const complianceItems: ComplianceItem[] = [
    {
      id: 'business_reg',
      title: 'Business Registration',
      status: 'compliant',
      description: 'Valid business registration with Business and Intellectual Property Authority (BIPA)',
      actions: ['Maintain annual returns', 'Update registered address if changed']
    },
    {
      id: 'tax_reg',
      title: 'Tax Registration',
      status: 'pending',
      description: 'Registration with Namibia Revenue Agency (NamRA)',
      dueDate: '2024-02-15',
      actions: ['Complete tax registration', 'Submit monthly VAT returns']
    },
    {
      id: 'consumer_protection',
      title: 'Consumer Protection Act',
      status: 'compliant',
      description: 'Compliance with Consumer Protection Act 2 of 2020',
      actions: ['Display pricing clearly', 'Provide service terms', 'Handle complaints properly']
    },
    {
      id: 'data_protection',
      title: 'Data Protection',
      status: 'pending',
      description: 'Compliance with data protection and privacy requirements',
      actions: ['Implement privacy policy', 'Secure customer data', 'Allow data deletion']
    },
    {
      id: 'labour_law',
      title: 'Labour Relations',
      status: 'compliant',
      description: 'Compliance with Labour Act 11 of 2007',
      actions: ['Fair employment practices', 'Proper contractor agreements', 'Social security contributions']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'non_compliant': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const pendingItems = complianceItems.filter(item => item.status === 'pending');
  const compliantItems = complianceItems.filter(item => item.status === 'compliant');

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{compliantItems.length}</div>
                <div className="text-sm text-gray-600">Compliant</div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{pendingItems.length}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{Math.round((compliantItems.length / complianceItems.length) * 100)}%</div>
                <div className="text-sm text-gray-600">Compliance Score</div>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions Alert */}
      {pendingItems.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            You have {pendingItems.length} pending compliance requirement(s) that need attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Compliance Details */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="consumer">Consumer</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Compliance Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complianceItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.title}</span>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </div>
                        {item.dueDate && (
                          <div className="text-xs text-red-600 mt-1">
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Business Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={businessRegistration.companyName}
                    onChange={(e) => setBusinessRegistration({
                      ...businessRegistration,
                      companyName: e.target.value
                    })}
                    placeholder="Enter registered company name"
                  />
                </div>
                <div>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={businessRegistration.registrationNumber}
                    onChange={(e) => setBusinessRegistration({
                      ...businessRegistration,
                      registrationNumber: e.target.value
                    })}
                    placeholder="BIPA registration number"
                  />
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>BIPA Registration Required:</strong> All businesses operating in Namibia must be registered with the Business and Intellectual Property Authority. 
                  Visit <span className="text-blue-600">www.bipa.na</span> for registration.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Tax Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxNumber">Tax Number</Label>
                  <Input
                    id="taxNumber"
                    value={taxCompliance.taxNumber}
                    onChange={(e) => setTaxCompliance({
                      ...taxCompliance,
                      taxNumber: e.target.value
                    })}
                    placeholder="NamRA tax number"
                  />
                </div>
                <div>
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input
                    id="vatNumber"
                    value={businessRegistration.vatNumber}
                    onChange={(e) => setBusinessRegistration({
                      ...businessRegistration,
                      vatNumber: e.target.value
                    })}
                    placeholder="VAT registration number"
                  />
                </div>
              </div>

              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tax Registration:</strong> Businesses with annual turnover exceeding NAD 500,000 must register for VAT. 
                  All service providers must register for income tax with NamRA.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Consumer Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="serviceTerms">Service Terms & Conditions</Label>
                  <Textarea
                    id="serviceTerms"
                    placeholder="Enter your service terms and conditions..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                  <Textarea
                    id="cancellationPolicy"
                    placeholder="Enter your cancellation and refund policy..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  <strong>Consumer Protection Act 2 of 2020:</strong> Service providers must clearly display pricing, 
                  provide service terms, handle complaints within 20 business days, and allow cancellations where applicable.
                </AlertDescription>
              </Alert>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button>
                  Save Terms
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
