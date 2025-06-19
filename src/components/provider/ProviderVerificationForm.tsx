import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, FileText, CreditCard, Users } from 'lucide-react';

export const ProviderVerificationForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState('documents');
  
  // Document upload state
  const [documents, setDocuments] = useState({
    national_id: null as File | null,
    proof_of_residence: null as File | null,
    bank_statement: null as File | null,
    professional_certificate: null as File | null
  });

  // Banking details state
  const [bankingDetails, setBankingDetails] = useState({
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    account_type: 'checking',
    routing_number: ''
  });

  // References state
  const [references, setReferences] = useState([
    {
      reference_name: '',
      reference_phone: '',
      reference_email: '',
      relationship: '',
      company_name: '',
      years_known: 0
    },
    {
      reference_name: '',
      reference_phone: '',
      reference_email: '',
      relationship: '',
      company_name: '',
      years_known: 0
    }
  ]);

  const [backgroundCheckConsent, setBackgroundCheckConsent] = useState(false);

  const handleFileUpload = (docType: keyof typeof documents, file: File) => {
    setDocuments(prev => ({ ...prev, [docType]: file }));
  };

  const uploadDocument = async (file: File, docType: string) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${docType}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Save document record
    const { error: dbError } = await supabase
      .from('provider_documents')
      .insert({
        provider_id: user.id,
        document_type: docType,
        document_name: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type
      });

    if (dbError) throw dbError;
    return fileName;
  };

  const handleSubmitVerification = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Upload documents
      const documentPromises = Object.entries(documents)
        .filter(([_, file]) => file !== null)
        .map(([type, file]) => uploadDocument(file!, type));

      await Promise.all(documentPromises);

      // Save banking details
      if (bankingDetails.bank_name && bankingDetails.account_number) {
        await supabase.from('provider_banking_details').insert({
          provider_id: user.id,
          ...bankingDetails
        });
      }

      // Save references
      const validReferences = references.filter(ref => 
        ref.reference_name && ref.reference_phone
      );

      if (validReferences.length > 0) {
        await supabase.from('provider_references').insert(
          validReferences.map(ref => ({
            provider_id: user.id,
            ...ref
          }))
        );
      }

      // Update user verification status
      await supabase.from('users').update({
        verification_status: 'under_review',
        verification_submitted_at: new Date().toISOString(),
        background_check_consent: backgroundCheckConsent
      }).eq('id', user.id);

      toast({
        title: "Verification Submitted",
        description: "Your verification application has been submitted and is under review.",
      });

      // Refresh the page to show new status
      window.location.reload();

    } catch (error) {
      console.error('Verification submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const hasDocuments = Object.values(documents).some(doc => doc !== null);
    const hasBankingDetails = bankingDetails.bank_name && bankingDetails.account_number;
    const hasReferences = references.some(ref => ref.reference_name && ref.reference_phone);
    return hasDocuments && hasBankingDetails && hasReferences && backgroundCheckConsent;
  };

  const handleConsentChange = (checked: boolean | "indeterminate") => {
    setBackgroundCheckConsent(checked === true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Provider Verification Application</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStep} onValueChange={setCurrentStep}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="banking">Banking</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Required Documents
              </h3>
              
              {Object.entries({
                national_id: 'National ID or Passport',
                proof_of_residence: 'Proof of Residence',
                bank_statement: 'Bank Statement',
                professional_certificate: 'Professional Certificate (Optional)'
              }).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(key as keyof typeof documents, file);
                      }}
                    />
                    {documents[key as keyof typeof documents] && (
                      <span className="text-sm text-green-600">✓ Selected</span>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="banking" className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Banking Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    value={bankingDetails.bank_name}
                    onChange={(e) => setBankingDetails(prev => ({
                      ...prev, bank_name: e.target.value
                    }))}
                    placeholder="e.g., Bank Windhoek"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Account Holder Name</Label>
                  <Input
                    value={bankingDetails.account_holder_name}
                    onChange={(e) => setBankingDetails(prev => ({
                      ...prev, account_holder_name: e.target.value
                    }))}
                    placeholder="Full name as on account"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    value={bankingDetails.account_number}
                    onChange={(e) => setBankingDetails(prev => ({
                      ...prev, account_number: e.target.value
                    }))}
                    placeholder="Account number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Select
                    value={bankingDetails.account_type}
                    onValueChange={(value) => setBankingDetails(prev => ({
                      ...prev, account_type: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="references" className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5" />
                Professional References (Minimum 2)
              </h3>
              
              {references.map((ref, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">Reference {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={ref.reference_name}
                        onChange={(e) => {
                          const newRefs = [...references];
                          newRefs[index].reference_name = e.target.value;
                          setReferences(newRefs);
                        }}
                        placeholder="Reference name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={ref.reference_phone}
                        onChange={(e) => {
                          const newRefs = [...references];
                          newRefs[index].reference_phone = e.target.value;
                          setReferences(newRefs);
                        }}
                        placeholder="Phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email (Optional)</Label>
                      <Input
                        type="email"
                        value={ref.reference_email}
                        onChange={(e) => {
                          const newRefs = [...references];
                          newRefs[index].reference_email = e.target.value;
                          setReferences(newRefs);
                        }}
                        placeholder="Email address"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Input
                        value={ref.relationship}
                        onChange={(e) => {
                          const newRefs = [...references];
                          newRefs[index].relationship = e.target.value;
                          setReferences(newRefs);
                        }}
                        placeholder="e.g., Previous employer"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                checked={backgroundCheckConsent}
                onCheckedChange={handleConsentChange}
              />
              <Label htmlFor="consent" className="text-sm">
                I consent to background checks and verification of the information provided
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmitVerification}
                disabled={!isFormValid() || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Verification'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
