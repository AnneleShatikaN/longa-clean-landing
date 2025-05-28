
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calendar, Target } from 'lucide-react';

interface MonthlyEarnings {
  month: string;
  earnings: number;
  jobsCompleted: number;
  averageRating: number;
}

interface EarningsTrackerProps {
  currentMonthEarnings: number;
  totalEarnings: number;
  monthlyData: MonthlyEarnings[];
  completedJobs: number;
}

const EarningsTracker: React.FC<EarningsTrackerProps> = ({
  currentMonthEarnings,
  totalEarnings,
  monthlyData,
  completedJobs,
}) => {
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const lastMonth = monthlyData[monthlyData.length - 2];
  const growthRate = lastMonth 
    ? ((currentMonthEarnings - lastMonth.earnings) / lastMonth.earnings) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-600" />
          Earnings Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">This Month</span>
              {growthRate !== 0 && (
                <Badge variant="outline" className={growthRate > 0 ? "text-green-600" : "text-red-600"}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-green-700">N${currentMonthEarnings}</p>
            <p className="text-xs text-green-600">{completedJobs} jobs completed</p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <span className="text-sm text-purple-700">Total Earnings</span>
            <p className="text-2xl font-bold text-purple-700">N${totalEarnings}</p>
            <p className="text-xs text-purple-600">All time</p>
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">Monthly Summary</span>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {monthlyData.slice(-6).reverse().map((month, index) => (
              <div key={month.month} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium text-sm">{month.month}</p>
                  <p className="text-xs text-gray-600">{month.jobsCompleted} jobs • {month.averageRating.toFixed(1)}★</p>
                </div>
                <span className="font-bold text-gray-900">N${month.earnings}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Monthly Goal</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${Math.min((currentMonthEarnings / 3000) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            N${currentMonthEarnings} of N$3,000 goal ({((currentMonthEarnings / 3000) * 100).toFixed(0)}%)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningsTracker;
