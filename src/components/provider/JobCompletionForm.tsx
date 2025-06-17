
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JobCompletionFormProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onComplete: (completionData: {
    visitNotes: string;
    beforePhotos: string[];
    afterPhotos: string[];
    issuesFound: string[];
    qualityScore: number;
  }) => Promise<void>;
}

export const JobCompletionForm: React.FC<JobCompletionFormProps> = ({
  isOpen,
  onClose,
  booking,
  onComplete
}) => {
  const [visitNotes, setVisitNotes] = useState('');
  const [issuesFound, setIssuesFound] = useState<string[]>([]);
  const [newIssue, setNewIssue] = useState('');
  const [qualityScore, setQualityScore] = useState(5);
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddIssue = () => {
    if (newIssue.trim()) {
      setIssuesFound([...issuesFound, newIssue.trim()]);
      setNewIssue('');
    }
  };

  const handleRemoveIssue = (index: number) => {
    setIssuesFound(issuesFound.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (files: FileList | null, type: 'before' | 'after') => {
    if (!files) return;
    
    // Simulate file upload - in real implementation, upload to Supabase Storage
    const uploadPromises = Array.from(files).map(async (file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      if (type === 'before') {
        setBeforePhotos([...beforePhotos, ...uploadedUrls]);
      } else {
        setAfterPhotos([...afterPhotos, ...uploadedUrls]);
      }
      toast({
        title: "Photos uploaded",
        description: `${uploadedUrls.length} ${type} photo(s) uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!visitNotes.trim()) {
      toast({
        title: "Visit notes required",
        description: "Please provide visit notes before completing the job.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete({
        visitNotes,
        beforePhotos,
        afterPhotos,
        issuesFound,
        qualityScore
      });
      onClose();
      toast({
        title: "Job completed",
        description: "Job has been marked as completed with documentation.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Complete Job - {booking?.service?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visit Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visit Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe the work performed, any observations, and completion details..."
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                rows={4}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Photo Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photo Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Before Photos</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files, 'before')}
                      className="hidden"
                      id="before-photos"
                    />
                    <label htmlFor="before-photos" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Upload before photos</p>
                    </label>
                  </div>
                  {beforePhotos.length > 0 && (
                    <div className="mt-2 text-sm text-green-600">
                      {beforePhotos.length} photo(s) uploaded
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">After Photos</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files, 'after')}
                      className="hidden"
                      id="after-photos"
                    />
                    <label htmlFor="after-photos" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Upload after photos</p>
                    </label>
                  </div>
                  {afterPhotos.length > 0 && (
                    <div className="mt-2 text-sm text-green-600">
                      {afterPhotos.length} photo(s) uploaded
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues & Special Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Issues & Special Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Report any issues found during service..."
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddIssue()}
                />
                <Button onClick={handleAddIssue} variant="outline">
                  Add
                </Button>
              </div>
              
              {issuesFound.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Reported Issues:</Label>
                  <div className="flex flex-wrap gap-2">
                    {issuesFound.map((issue, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveIssue(index)}
                      >
                        {issue} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quality Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Quality Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-sm">Rate the overall quality of your work (1-5 stars)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setQualityScore(star)}
                      className={`text-2xl ${
                        star <= qualityScore ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  This helps maintain service standards and client satisfaction
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !visitNotes.trim()}
              className="flex-1"
            >
              {isSubmitting ? "Completing..." : "Complete Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
