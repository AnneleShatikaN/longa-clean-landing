
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Package, 
  CreditCard, 
  MessageCircle, 
  Copy,
  ArrowLeft,
  Clock,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { usePaymentInstructions } from '@/hooks/usePaymentInstructions';
import { toast } from 'sonner';

interface PackagePurchaseFlowProps {
  packageId?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

type PurchaseStep = 'selection' | 'details' | 'payment' | 'confirmation';

export const PackagePurchaseFlow: React.FC<PackagePurchaseFlowProps> = ({
  packageId,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { packages, isLoading, createPackagePurchase } = useSubscriptionPackages();
  const { paymentInstructions, generateReference } = usePaymentInstructions();
  
  const [currentStep, setCurrentStep] = useState<PurchaseStep>(packageId ? 'details' : 'selection');
  const [selectedPackageId, setSelectedPackageId] = useState<string>(packageId || '');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPackage = packages.find(p => p.id === selectedPackageId);

  const handlePackageSelect = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    setCurrentStep('details');
  };

  const handleDetailsSubmit = () => {
    if (!whatsappNumber.trim()) {
      toast.error('WhatsApp number is required');
      return;
    }
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    try {
      await createPackagePurchase(selectedPackageId);
      
      toast.success('Package purchase submitted!', {
        description: 'We\'ll verify your payment and activate your package within 24 hours.'
      });
      
      setCurrentStep('confirmation');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to submit purchase', {
        description: 'Please try again or contact support.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const reference = generateReference(selectedPackageId, user?.id);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {(['selection', 'details', 'payment', 'confirmation'] as PurchaseStep[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full
                ${['selection', 'details', 'payment', 'confirmation'].indexOf(currentStep) >= index
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {index + 1}
              </div>
              {index < 3 && (
                <div className={`
                  w-16 h-0.5 mx-2
                  ${['selection', 'details', 'payment', 'confirmation'].indexOf(currentStep) > index
                    ? 'bg-purple-600'
                    : 'bg-gray-200'
                  }
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'selection' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Choose Your Package</h2>
            <p className="text-gray-600">Select the perfect cleaning package for your needs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedPackageId === pkg.id ? 'ring-2 ring-purple-600' : ''
                }`}
                onClick={() => handlePackageSelect(pkg.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{pkg.name}</span>
                    <Badge>N${pkg.price}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  <ul className="space-y-2">
                    {pkg.entitlements?.map((ent, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {ent.quantity_per_cycle}× {ent.service?.name} per month
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'details' && selectedPackage && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep('selection')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Contact Details</h2>
              <p className="text-gray-600">We'll use these details to confirm your purchase</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Selected Package</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{selectedPackage.name}</h3>
                  <p className="text-gray-600">{selectedPackage.description}</p>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  N${selectedPackage.price}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                <Input
                  id="whatsapp"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+264 81 123 4567"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  We'll send payment confirmation via WhatsApp
                </p>
              </div>

              <div>
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special requirements or preferences..."
                />
              </div>

              <Button onClick={handleDetailsSubmit} className="w-full">
                Continue to Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 'payment' && selectedPackage && paymentInstructions && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep('details')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold">Payment Instructions</h2>
              <p className="text-gray-600">Make your payment using the details below</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Banking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentInstructions.additional_instructions && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 mb-2 font-medium">Payment Instructions:</p>
                  <p className="text-sm text-blue-600">
                    {paymentInstructions.additional_instructions}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Account Name:</span>
                  <div className="flex items-center gap-2">
                    <span>{paymentInstructions.account_name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentInstructions.account_name, 'Account name')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Bank:</span>
                  <div className="flex items-center gap-2">
                    <span>{paymentInstructions.bank_name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentInstructions.bank_name, 'Bank name')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{paymentInstructions.account_number}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(paymentInstructions.account_number, 'Account number')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {paymentInstructions.branch_code && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Branch Code:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{paymentInstructions.branch_code}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(paymentInstructions.branch_code, 'Branch code')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {paymentInstructions.swift_code && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">SWIFT Code:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{paymentInstructions.swift_code}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(paymentInstructions.swift_code, 'SWIFT code')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="font-medium">Reference:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{reference}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(reference, 'Reference')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Amount:</span>
                  <span className="text-purple-600">N${selectedPackage.price}</span>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <MessageCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Next Steps:</p>
                    <ol className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>1. Make the payment using the banking details above</li>
                      <li>2. Use the provided reference number for your payment</li>
                      <li>3. Send proof of payment via WhatsApp to our support team</li>
                      <li>4. We'll activate your package within 24 hours</li>
                    </ol>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handlePaymentSubmit}
                disabled={isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? 'Processing...' : 'Mark as Paid'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 'confirmation' && selectedPackage && (
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Purchase Submitted!</h2>
            <p className="text-gray-600">
              Your {selectedPackage.name} purchase has been submitted successfully.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>We'll verify your payment within 24 hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  <span>You'll receive WhatsApp confirmation once activated</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-purple-500" />
                  <span>Your package will be ready to use immediately after activation</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => window.location.href = '/client-dashboard'}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
