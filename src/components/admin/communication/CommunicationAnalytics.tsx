
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, DollarSign, Clock, Target } from 'lucide-react';

interface CommunicationAnalyticsProps {
  analytics: any;
}

export const CommunicationAnalytics: React.FC<CommunicationAnalyticsProps> = ({ analytics }) => {
  const deliveryData = [
    { channel: 'In-App', delivered: 889, failed: 3, cost: 0 },
    { channel: 'Email', delivered: 423, failed: 33, cost: 9.12 },
    { channel: 'SMS', delivered: 119, failed: 4, cost: 30.75 },
    { channel: 'Push', delivered: 298, failed: 36, cost: 3.34 }
  ];

  const timeSeriesData = [
    { day: 'Mon', sent: 180, delivered: 168 },
    { day: 'Tue', sent: 220, delivered: 205 },
    { day: 'Wed', sent: 190, delivered: 182 },
    { day: 'Thu', sent: 250, delivered: 238 },
    { day: 'Fri', sent: 280, delivered: 265 },
    { day: 'Sat', sent: 150, delivered: 142 },
    { day: 'Sun', sent: 130, delivered: 125 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const totalCost = deliveryData.reduce((sum, channel) => sum + channel.cost, 0);
  const totalSent = deliveryData.reduce((sum, channel) => sum + channel.delivered + channel.failed, 0);
  const overallDeliveryRate = deliveryData.reduce((sum, channel) => sum + channel.delivered, 0) / totalSent * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold">{overallDeliveryRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold">23.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">N${totalCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold">3.2h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deliveryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="delivered" fill="#8884d8" name="Delivered" />
                <Bar dataKey="failed" fill="#ff7c7c" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Delivery Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Sent" />
                <Line type="monotone" dataKey="delivered" stroke="#82ca9d" name="Delivered" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveryData.map((channel, index) => {
              const costPerMessage = channel.cost / (channel.delivered + channel.failed);
              const successRate = (channel.delivered / (channel.delivered + channel.failed)) * 100;
              
              return (
                <div key={channel.channel} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <div>
                      <p className="font-medium">{channel.channel}</p>
                      <p className="text-sm text-gray-600">
                        {channel.delivered + channel.failed} messages
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">N${channel.cost.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">
                      N${costPerMessage.toFixed(3)}/msg
                    </p>
                    <Badge 
                      variant={successRate > 95 ? "default" : successRate > 90 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {successRate.toFixed(1)}% success
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
