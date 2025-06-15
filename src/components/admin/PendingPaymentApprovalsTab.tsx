
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Phone, User, Check, X } from "lucide-react";

// Simulated mock data for pending payment approvals
const initialPayments = [
  {
    id: "1",
    userFullName: "Carmen Iipinge",
    userPhone: "+264 81 555 1234",
    userEmail: "carmen@example.com",
    packageName: "Professional Cleaners Package (3 Months)",
    reference: "33887988",
    status: "pending", // pending | approved | rejected
  },
  {
    id: "2",
    userFullName: "Johan Becker",
    userPhone: "+264 81 448 2288",
    userEmail: "jbecker@example.com",
    packageName: "Premium Maintenance (Annual)",
    reference: "",
    status: "pending",
  },
];

const statusColor = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export const PendingPaymentApprovalsTab: React.FC = () => {
  const [payments, setPayments] = useState(initialPayments);

  const handleApprove = (id: string) => {
    setPayments((arr) =>
      arr.map((p) =>
        p.id === id ? { ...p, status: "approved" } : p
      )
    );
    // Simulate WhatsApp message trigger with toast
    const user = payments.find((p) => p.id === id);
    toast({
      title: "Payment Approved",
      description: (
        <div>
          <div>
            Hi {user?.userFullName}, your payment has been approved 🎉 <br />
            Your <b>{user?.packageName}</b> is now active. <br />
            You can now book your services via the app.<br />
            Thank you!
          </div>
          <div className="mt-2 text-xs text-gray-500">
            (<b>Simulated WhatsApp message triggered</b>)
          </div>
        </div>
      ),
      variant: "default",
    });
  };

  const handleReject = (id: string) => {
    setPayments((arr) =>
      arr.map((p) =>
        p.id === id ? { ...p, status: "rejected" } : p
      )
    );
    toast({
      title: "Payment Rejected",
      description: "The client has been notified (simulated).",
      variant: "destructive",
    });
    // Simulate notification to user (for demo only)
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pending Payment Approvals</h2>
      <div className="grid gap-4">
        {payments.length === 0 && (
          <Card>
            <CardContent className="py-6 text-gray-500 text-center">
              No pending bank deposit payment requests.
            </CardContent>
          </Card>
        )}

        {payments.map((payment) => (
          <Card key={payment.id} className="shadow hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <User className="h-4 w-4" />
                    {payment.userFullName}
                    <span className="ml-2 text-xs text-gray-500">
                      {payment.userEmail}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-800">
                    <Phone className="h-4 w-4" />
                    {payment.userPhone}
                  </div>
                  <div className="text-sm text-gray-700">
                    Package: <span className="font-medium">{payment.packageName}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    Reference:{" "}
                    <span className="font-mono">
                      {payment.reference || <span className="text-gray-400">N/A</span>}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 mt-3 md:mt-0 min-w-[180px]">
                  <Badge className={statusColor[payment.status as keyof typeof statusColor]}>
                    {payment.status === "pending"
                      ? "Pending Approval"
                      : payment.status === "approved"
                      ? "Approved"
                      : "Rejected"}
                  </Badge>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      disabled={payment.status !== "pending"}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(payment.id)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={payment.status !== "pending"}
                      onClick={() => handleReject(payment.id)}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PendingPaymentApprovalsTab;
