import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileInput } from '@/components/ui/file-input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, GraduationCap } from 'lucide-react';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';

interface ProviderVerificationFormProps {
  onSubmissionComplete: () => void;
}

export const ProviderVerificationForm: React.FC<ProviderVerificationFormProps> = ({
  onSubmissionComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [contactNumber, setContactNumber] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [hasCriminalRecord, setHasCriminalRecord] = useState(false);
  const [criminalRecordExplanation, setCriminalRecordExplanation] = useState('');
  const [references, setReferences] = useState(['', '', '']);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCertificate, setHasCertificate] = useState<boolean | null>(null);

  // Check if provider has completed academy training
  useEffect(() => {
    const checkCertificate = async () => {
      if (!user?.provider_category) return;
      
      try {
        const { data, error } = await supabase
          .from('provider_certificates')
          .select('id')
          .eq('provider_id', user.id)
          .eq('service_type', user.provider_category)
          .eq('is_active', true)
          .single();
          
        setHasCertificate(!!data && !error);
      } catch (err) {
        setHasCertificate(false);
      }
    };
    
    checkCertificate();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          phone: contactNumber,
          address: address,
          bio: bio,
          years_of_experience: yearsOfExperience,
          has_criminal_record: hasCriminalRecord,
          criminal_record_explanation: criminalRecordExplanation,
          verification_status: 'pending'
        })
        .eq('id', user?.id);

      if (userError) throw userError;

      // 2. Upload documents
      for (const file of documentFiles) {
        const { error: storageError } = await supabase
          .storage
          .from('provider-documents')
          .upload(`${user?.id}/${file.name}`, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (storageError) throw storageError;
      }

      // 3. Update verification status
      const { error: verificationError } = await supabase
        .from('users')
        .update({
          verification_status: 'under_review'
        })
        .eq('id', user?.id);

      if (verificationError) throw verificationError;

      toast({
        title: "Submission Successful",
        description: "Your verification documents have been submitted for review.",
      });
      onSubmissionComplete();
      navigate('/provider-dashboard');

    } catch (error: any) {
      console.error("Error during submission:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReferenceChange = (index: number, value: string) => {
    const newReferences = [...references];
    newReferences[index] = value;
    setReferences(newReferences);
  };

  const handleDocumentChange = (files: FileList | null) => {
    if (files) {
      const fileArray: File[] = Array.from(files);
      setDocumentFiles(fileArray);
    }
  };

  // Show academy requirement if no certificate
  if (hasCertificate === false) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-8 text-center">
          <GraduationCap className="h-16 w-16 text-yellow-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">
            Training Required
          </h2>
          <p className="text-yellow-700 mb-6">
            Before you can upload verification documents, you must complete the 
            Longa Academy training program for your service category.
          </p>
          <Button 
            onClick={() => window.location.href = '/provider-dashboard?tab=academy'} 
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Start Training
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (hasCertificate === null) {
    return <EnhancedLoading message="Checking training status..." />;
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Success message showing training completion */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">
              Training completed! You can now proceed with document verification.
            </p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                type="tel"
                id="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio about yourself"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Background */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                type="number"
                id="yearsOfExperience"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                min="0"
              />
            </div>
            <div>
              <Label>References</Label>
              {references.map((reference, index) => (
                <Input
                  key={index}
                  type="text"
                  placeholder={`Reference ${index + 1}`}
                  value={reference}
                  onChange={(e) => handleReferenceChange(index, e.target.value)}
                  className="mb-2"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Criminal Record */}
        <Card>
          <CardHeader>
            <CardTitle>Criminal Record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasCriminalRecord"
                checked={hasCriminalRecord}
                onCheckedChange={(checked) => setHasCriminalRecord(!!checked)}
              />
              <Label htmlFor="hasCriminalRecord">Do you have a criminal record?</Label>
            </div>
            {hasCriminalRecord && (
              <div>
                <Label htmlFor="criminalRecordExplanation">Explanation</Label>
                <Textarea
                  id="criminalRecordExplanation"
                  value={criminalRecordExplanation}
                  onChange={(e) => setCriminalRecordExplanation(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>
                Upload Documents (e.g., ID, certifications, etc.)
              </Label>
              <FileInput onChange={handleDocumentChange} multiple />
            </div>
            {documentFiles.length > 0 && (
              <div>
                <p>Selected Files:</p>
                <ul>
                  {documentFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit Verification"}
        </Button>
      </form>
    </div>
  );
};
