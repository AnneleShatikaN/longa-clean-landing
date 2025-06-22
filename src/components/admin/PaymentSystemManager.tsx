
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PendingPaymentApprovals } from '@/components/admin/PendingPaymentApprovals';
import JobAssignmentManager from '@/components/admin/JobAssignmentManager';
import { DynamicBankDepositInstructions } from '@/components/payment/DynamicBankDepositInstructions';
import { CheckCircle, Users, CreditCard, Settings } from 'lucide-react';

export const PaymentSystemManager = () => {
  const handleMarkAsPaid = () => {
    console.log('Payment marked as paid (admin preview)');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Payment System</h2>
        <p className="text-gray-600">Manage payment approvals and job assignments</p>
      </div>

      <Tabs defaultValue="approvals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Payment Approvals
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Job Assignments
          </TabsTrigger>
          <TabsTrigger value="instructions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Instructions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <PendingPaymentApprovals />
        </TabsContent>

        <TabsContent value="assignments">
          <JobAssignmentManager />
        </TabsContent>

        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle>Payment Instructions Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <DynamicBankDepositInstructions 
                amount={150} 
                serviceId="sample-service-id"
                onMarkAsPaid={handleMarkAsPaid}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
