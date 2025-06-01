
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Building, 
  FileText, 
  Calculator, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Globe
} from 'lucide-react';

interface ComplianceStatus {
  businessRegistration: 'compliant' | 'pending' | 'required';
  taxRegistration: 'compliant' | 'pending' | 'required';
  consumerProtection: 'compliant' | 'pending' | 'required';
  dataProtection: 'compliant' | 'pending' | 'required';
  workerRights: 'compliant' | 'pending' | 'required';
}

interface TaxCompliance {
  vatRegistered: boolean;
  vatNumber?: string;
  incomeTaxRegistered: boolean;
  taxYear: string;
  quarterlyReturns: boolean;
}

export const NamibianCompliance: React.FC = () => {
  const [complianceStatus] = useState<ComplianceStatus>({
    businessRegistration: 'compliant',
    taxRegistration: 'compliant',
    consumerProtection: 'compliant',
    dataProtection: 'pending',
    workerRights: 'compliant'
  });

  const [taxCompliance] = useState<TaxCompliance>({
    vatRegistered: true,
    vatNumber: 'VAT123456789',
    incomeTaxRegistered: true,
    taxYear: '2024',
    quarterlyReturns: true
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'required': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'required': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  const calculateComplianceScore = () => {
    const statuses = Object.values(complianceStatus);
    const compliantCount = statuses.filter(status => status === 'compliant').length;
    return Math.round((compliantCount / statuses.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Namibian Compliance Status
            </div>
            <Badge variant="outline" className="text-lg">
              {calculateComplianceScore()}% Compliant
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={calculateComplianceScore()} className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(complianceStatus).map(([key, status]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </div>
                <Badge className={getStatusColor(status)}>
                  {status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Registration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Business Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Business Registration Number</label>
                <div className="p-2 bg-gray-50 rounded border">CC/2024/123456</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Registration Date</label>
                <div className="p-2 bg-gray-50 rounded border">2024-01-15</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Type</label>
                <div className="p-2 bg-gray-50 rounded border">Close Corporation</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Industry Classification</label>
                <div className="p-2 bg-gray-50 rounded border">Technology Services</div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Regulatory Requirements</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Business must be registered with the Business and Intellectual Property Authority (BIPA)</li>
                <li>• Annual returns must be filed by the anniversary date</li>
                <li>• Changes to business details must be reported within 21 days</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Tax Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">VAT Registration</h4>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Registered for VAT</span>
                </div>
                {taxCompliance.vatNumber && (
                  <div className="text-sm text-gray-600">
                    VAT Number: {taxCompliance.vatNumber}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Income Tax</h4>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Registered for Income Tax</span>
                </div>
                <div className="text-sm text-gray-600">
                  Tax Year: {taxCompliance.taxYear}
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Tax Obligations</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• VAT returns due monthly (if turnover > NAD 500,000)</li>
                <li>• Income tax returns due by 31 July each year</li>
                <li>• Quarterly provisional tax payments required</li>
                <li>• Employee tax (PAYE) deductions and payments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consumer Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Consumer Protection Act Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Terms & Conditions</h4>
                <div className="text-sm text-gray-600 mb-2">
                  Clear, plain language terms governing service provision
                </div>
                <Badge className="bg-green-100 text-green-800">Compliant</Badge>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Pricing Transparency</h4>
                <div className="text-sm text-gray-600 mb-2">
                  All prices displayed in NAD including applicable taxes
                </div>
                <Badge className="bg-green-100 text-green-800">Compliant</Badge>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Cooling-off Period</h4>
                <div className="text-sm text-gray-600 mb-2">
                  7-day cancellation right for subscription services
                </div>
                <Badge className="bg-green-100 text-green-800">Implemented</Badge>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Complaint Resolution</h4>
                <div className="text-sm text-gray-600 mb-2">
                  Formal complaint handling process established
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Regulations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Industry-Specific Regulations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Service Provider Requirements</h4>
              <ul className="text-sm space-y-1">
                <li>• Professional liability insurance recommended</li>
                <li>• Trade-specific certifications where applicable</li>
                <li>• Worker classification compliance (employee vs contractor)</li>
                <li>• Minimum wage compliance for all workers</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Platform Responsibilities</h4>
              <ul className="text-sm space-y-1">
                <li>• KYC (Know Your Customer) verification for providers</li>
                <li>• Transaction monitoring and reporting</li>
                <li>• Data protection and privacy compliance</li>
                <li>• Anti-money laundering measures</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <FileText className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Generate Tax Report</div>
                <div className="text-sm text-gray-600">Monthly tax summary</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Compliance Audit</div>
                <div className="text-sm text-gray-600">Full compliance check</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Update Policies</div>
                <div className="text-sm text-gray-600">Review legal documents</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
