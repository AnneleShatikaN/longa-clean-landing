
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { Calendar, MapPin, User, Phone, Clock, Star } from 'lucide-react';

interface Job {
  id: string;
  service: string;
  clientName: string;
  clientPhone?: string; // Made optional to match useProviderData
  location: string;
  amount: number;
  date: string;
  status: 'requested' | 'accepted' | 'completed';
  duration: string;
  rating?: number;
  expectedPayout: number;
}

interface ProviderJobsTabProps {
  availableJobs: Job[];
  myJobs: Job[];
  onAcceptJob: (jobId: string) => void;
  onDeclineJob: (jobId: string) => void;
  onCompleteJob: (jobId: string) => void;
  isAvailable: boolean;
}

const ProviderJobsTab: React.FC<ProviderJobsTabProps> = ({
  availableJobs,
  myJobs,
  onAcceptJob,
  onDeclineJob,
  onCompleteJob,
  isAvailable
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'requested': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Available Jobs */}
      {isAvailable && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Jobs ({availableJobs.length})
          </h3>
          {availableJobs.length === 0 ? (
            <EmptyState
              title="No Available Jobs"
              description="No jobs are currently available in your area."
            />
          ) : (
            <div className="space-y-4">
              {availableJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{job.service}</h4>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <User className="h-4 w-4 mr-1" />
                            {job.clientName}
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Available
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {job.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {job.duration}
                        </div>
                        {job.clientPhone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {job.clientPhone}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-lg font-semibold text-purple-600">
                          Expected: N${job.expectedPayout}
                        </div>
                        <div className="text-xs text-purple-500">
                          Client pays: N${job.amount}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => onAcceptJob(job.id)}
                          className="bg-green-600 hover:bg-green-700 flex-1"
                          size="sm"
                        >
                          Accept
                        </Button>
                        <Button 
                          onClick={() => onDeclineJob(job.id)}
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Jobs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          My Jobs ({myJobs.length})
        </h3>
        {myJobs.length === 0 ? (
          <EmptyState
            title="No Jobs Yet"
            description="You haven't accepted any jobs yet. Check available jobs above!"
          />
        ) : (
          <div className="space-y-4">
            {myJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{job.service}</h4>
                        <p className="text-sm text-gray-600">{job.clientName}</p>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {job.date}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-purple-600">N${job.expectedPayout}</span>
                      {job.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm">{job.rating}/5</span>
                        </div>
                      )}
                    </div>
                    
                    {job.status === 'accepted' && (
                      <Button 
                        onClick={() => onCompleteJob(job.id)}
                        className="bg-green-600 hover:bg-green-700 w-full"
                        size="sm"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderJobsTab;
