
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Calendar, 
  Star, 
  TrendingUp,
  Briefcase,
  Clock
} from 'lucide-react';

interface ProviderProfile {
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalJobs: number;
  location: string;
  joinDate: string;
  lastActive: string;
}

interface ProviderStats {
  totalEarnings: number;
  pendingPayouts: number;
  thisWeekEarnings: number;
  availableJobs: number;
  completedJobs: number;
  averageRating: number;
}

interface ProviderOverviewTabProps {
  profile?: ProviderProfile;
  stats: ProviderStats;
}

export const ProviderOverviewTab: React.FC<ProviderOverviewTabProps> = ({
  profile,
  stats
}) => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N$ {stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +N$ {stats.thisWeekEarnings.toFixed(2)} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableJobs}</div>
            <p className="text-xs text-muted-foreground">
              Ready to accept
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
            <p className="text-xs text-muted-foreground">
              Total completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {stats.averageRating.toFixed(1)}
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">
              From client reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N$ {stats.pendingPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Processing soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12%</div>
            <p className="text-xs text-muted-foreground">
              From last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Summary */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Name:</span> {profile.name}</p>
                  <p><span className="font-medium">Email:</span> {profile.email}</p>
                  <p><span className="font-medium">Phone:</span> {profile.phone}</p>
                  <p><span className="font-medium">Location:</span> {profile.location}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Provider Stats</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Join Date:</span> {new Date(profile.joinDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Total Jobs:</span> {profile.totalJobs}</p>
                  <p><span className="font-medium">Rating:</span> 
                    <span className="ml-1 inline-flex items-center">
                      {profile.rating.toFixed(1)} 
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-1" />
                    </span>
                  </p>
                  <p><span className="font-medium">Status:</span> 
                    <Badge variant="outline" className="ml-1 bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">View Calendar</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Earnings</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Briefcase className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Available Jobs</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
              <p className="text-sm font-medium">Reviews</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
