
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Award } from 'lucide-react';
import { ProviderCertificate } from '@/types/learning';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface CertificateDisplayProps {
  certificate: ProviderCertificate;
  providerName: string;
  onBack: () => void;
}

export const CertificateDisplay: React.FC<CertificateDisplayProps> = ({
  certificate,
  onBack
}) => {
  const { user } = useAuth();

  const handleDownload = () => {
    if (certificate.pdf_url) {
      window.open(certificate.pdf_url, '_blank');
    }
  };

  const serviceTypeLabel = certificate.service_type.charAt(0).toUpperCase() + 
                          certificate.service_type.slice(1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Academy
        </Button>
        <Button onClick={handleDownload} disabled={!certificate.pdf_url}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Certificate */}
      <Card className="border-2 border-blue-200">
        <CardContent className="p-12">
          <div className="text-center space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <Award className="h-16 w-16 text-blue-600 mx-auto" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Certificate of Completion
                </h1>
                <p className="text-lg text-gray-600">
                  Longa Academy Training Program
                </p>
              </div>
            </div>

            {/* Decorative line */}
            <div className="flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent w-64"></div>
            </div>

            {/* Main content */}
            <div className="space-y-6">
              <p className="text-lg text-gray-700">
                This is to certify that
              </p>
              
              <h2 className="text-3xl font-bold text-blue-800">
                {user?.full_name || 'Provider Name'}
              </h2>
              
              <p className="text-lg text-gray-700">
                has successfully completed the
              </p>
              
              <h3 className="text-2xl font-semibold text-gray-900">
                {serviceTypeLabel} Services Training Program
              </h3>
              
              <p className="text-gray-600">
                and has demonstrated proficiency in all required competencies
              </p>
            </div>

            {/* Footer */}
            <div className="pt-8 space-y-4">
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <p className="text-sm text-gray-600">Certificate ID</p>
                  <p className="font-mono font-semibold text-gray-900">
                    {certificate.certificate_id}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Date Issued</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(certificate.issued_at), 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  This certificate verifies that the holder has completed all required 
                  training modules and assessments for the {serviceTypeLabel} service category 
                  as part of the Longa Provider Certification Program.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">
                Congratulations on Your Achievement!
              </h3>
              <p className="text-green-700 mt-1">
                You can now proceed to the verification section to upload your documents 
                and complete your provider registration process.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
