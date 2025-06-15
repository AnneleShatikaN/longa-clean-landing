
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, DollarSign, Clock, TrendingUp, Wallet, MapPin } from 'lucide-react';

interface ProviderOverviewTabProps {
  profile: any;
  stats: {
    totalEarnings: number;
    pendingPayouts: number;
    thisWeekEarnings: number;
    availableJobs: number;
    completedJobs: number;
    averageRating: number;
  };
}

const ProviderOverviewTab: React.FC<ProviderOverviewTabProps> = ({ profile, stats }) => {
  return (
    <div className="space-y-6">
      {/* Profile Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-purple-600">
                {profile?.name?.charAt(0) || 'P'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{profile?.name || 'Provider'}</h3>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-medium">{stats.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-600">{stats.completedJobs} jobs completed</span>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-600">{profile?.location || 'Location not set'}</span>
                </div>
              </div>
              <div className="flex space-x-2 mt-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Active
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Verified
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <p className="text-xl font-bold text-orange-600">N${stats.pendingPayouts}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">This Week</span>
            </div>
            <p className="text-xl font-bold text-green-600">N${stats.thisWeekEarnings}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <p className="text-xl font-bold text-blue-600">{stats.availableJobs}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <p className="text-xl font-bold text-purple-600">N${stats.totalEarnings}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-medium">House Cleaning Completed</p>
                <p className="text-sm text-gray-600">Client: Maria Santos</p>
              </div>
              <Badge className="bg-green-100 text-green-800">+N$120</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-medium">Garden Maintenance</p>
                <p className="text-sm text-gray-600">Client: John Smith</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">New Job Available</p>
                <p className="text-sm text-gray-600">Office Cleaning - Windhoek</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderOverviewTab;
