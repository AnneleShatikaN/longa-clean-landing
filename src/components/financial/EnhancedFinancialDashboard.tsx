
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialOverview } from '@/components/admin/FinancialOverview';
import { PredictiveAnalytics } from '@/components/financial/PredictiveAnalytics';
import { AutomatedPayoutManager } from '@/components/financial/AutomatedPayoutManager';
import { PayoutProcessor } from '@/components/financial/PayoutProcessor';
import { BankingIntegration } from '@/components/financial/BankingIntegration';
import { FinancialReporting } from '@/components/financial/FinancialReporting';
import { 
  TrendingUp, 
  DollarSign, 
  Settings, 
  CreditCard, 
  BarChart3, 
  Zap,
  Brain,
  FileText
} from 'lucide-react';

export const EnhancedFinancialDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Management Center</h1>
        <p className="text-gray-600">
          Comprehensive financial analytics, automated payouts, and business intelligence
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Predictive Analytics
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automated Payouts
          </TabsTrigger>
          <TabsTrigger value="processor" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Payout Processor
          </TabsTrigger>
          <TabsTrigger value="banking" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Banking
          </TabsTrigger>
          <TabsTrigger value="reporting" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Business Intelligence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <FinancialOverview />
        </TabsContent>

        <TabsContent value="analytics">
          <PredictiveAnalytics />
        </TabsContent>

        <TabsContent value="automation">
          <AutomatedPayoutManager />
        </TabsContent>

        <TabsContent value="processor">
          <PayoutProcessor />
        </TabsContent>

        <TabsContent value="banking">
          <BankingIntegration />
        </TabsContent>

        <TabsContent value="reporting">
          <FinancialReporting />
        </TabsContent>

        <TabsContent value="intelligence">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Business Intelligence & Market Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pricing Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      AI-powered pricing recommendations based on demand, competition, and profitability analysis.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>House Cleaning:</span>
                        <span className="font-medium text-green-600">+15% recommended</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Garden Maintenance:</span>
                        <span className="font-medium text-blue-600">Optimal pricing</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Plumbing Services:</span>
                        <span className="font-medium text-yellow-600">-5% for competition</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Demand Forecasting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Predict peak demand periods and optimize resource allocation.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Next Week:</span>
                        <span className="font-medium text-green-600">High demand (+20%)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Peak Hours:</span>
                        <span className="font-medium">09:00 - 11:00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Top Service:</span>
                        <span className="font-medium">House Cleaning</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Market Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Competitive analysis and market positioning recommendations.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Market Share:</span>
                        <span className="font-medium text-blue-600">12% in Windhoek</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Growth Rate:</span>
                        <span className="font-medium text-green-600">+8% monthly</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Competitive Position:</span>
                        <span className="font-medium text-yellow-600">Strong</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Deep dive into customer behavior and satisfaction patterns.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg. Satisfaction:</span>
                        <span className="font-medium text-green-600">4.6/5.0</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Repeat Rate:</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Churn Risk:</span>
                        <span className="font-medium text-yellow-600">12% medium</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Provider Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Provider performance trends and capacity optimization.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Capacity Utilization:</span>
                        <span className="font-medium text-blue-600">78%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Top Performer:</span>
                        <span className="font-medium">John Smith (97%)</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Training Needed:</span>
                        <span className="font-medium text-yellow-600">3 providers</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Key financial indicators and risk assessment.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Profit Margin:</span>
                        <span className="font-medium text-green-600">23.5%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cash Flow:</span>
                        <span className="font-medium text-green-600">Healthy</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Risk Score:</span>
                        <span className="font-medium text-green-600">Low (2/10)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
