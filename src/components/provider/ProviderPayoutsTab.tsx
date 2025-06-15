
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react';

interface ProviderPayoutsTabProps {
  monthlyEarnings: any[];
  completedJobs: any[];
  pendingPayouts: number;
  totalEarnings: number;
}

const ProviderPayoutsTab: React.FC<ProviderPayoutsTabProps> = ({
  monthlyEarnings,
  completedJobs,
  pendingPayouts,
  totalEarnings
}) => {
  const getPayoutStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Payout Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-gray-600">Pending Payouts</span>
            </div>
            <p className="text-xl font-bold text-orange-600">N${pendingPayouts}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Total Earned</span>
            </div>
            <p className="text-xl font-bold text-green-600">N${totalEarnings}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">This Month</span>
            </div>
            <p className="text-xl font-bold text-blue-600">
              N${monthlyEarnings[monthlyEarnings.length - 1]?.earnings || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payouts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          {completedJobs.length === 0 ? (
            <EmptyState
              title="No Payouts Yet"
              description="Complete jobs to start earning payouts."
            />
          ) : (
            <div className="space-y-3">
              {completedJobs.slice(0, 10).map((job) => (
                <div key={job.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium">{job.service}</p>
                    <p className="text-sm text-gray-600">{job.clientName}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {job.completedDate || job.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">N${job.expectedPayout}</p>
                    <Badge className={`${getPayoutStatusColor(job.payoutStatus)} text-xs`}>
                      {job.payoutStatus || 'pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Earnings Chart */}
      {monthlyEarnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {monthlyEarnings.map((month) => (
                <div key={month.month} className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">{month.month}</span>
                  <div className="text-right">
                    <span className="font-semibold">N${month.earnings}</span>
                    <span className="text-xs text-gray-500 ml-2">({month.jobs} jobs)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProviderPayoutsTab;
