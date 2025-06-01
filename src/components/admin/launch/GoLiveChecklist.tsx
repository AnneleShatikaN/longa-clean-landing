
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, AlertTriangle, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'system' | 'security' | 'data' | 'performance' | 'testing';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  required: boolean;
}

const checklistItems: ChecklistItem[] = [
  {
    id: 'system_health',
    title: 'System Health Check',
    description: 'Verify all core systems are operational',
    category: 'system',
    status: 'completed',
    required: true,
  },
  {
    id: 'data_backup',
    title: 'Data Backup Verification',
    description: 'Ensure all data is properly backed up',
    category: 'data',
    status: 'completed',
    required: true,
  },
  {
    id: 'security_audit',
    title: 'Security Audit',
    description: 'Complete security vulnerability assessment',
    category: 'security',
    status: 'in_progress',
    required: true,
  },
  {
    id: 'performance_test',
    title: 'Performance Testing',
    description: 'Load testing and performance optimization',
    category: 'performance',
    status: 'pending',
    required: true,
  },
  {
    id: 'user_acceptance',
    title: 'User Acceptance Testing',
    description: 'End-to-end user journey testing',
    category: 'testing',
    status: 'pending',
    required: true,
  },
  {
    id: 'monitoring_setup',
    title: 'Monitoring Setup',
    description: 'Configure production monitoring and alerts',
    category: 'system',
    status: 'completed',
    required: true,
  },
  {
    id: 'documentation',
    title: 'Documentation Review',
    description: 'Ensure all documentation is up to date',
    category: 'system',
    status: 'pending',
    required: false,
  },
];

export const GoLiveChecklist: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState(checklistItems);

  const completedItems = items.filter(item => item.status === 'completed').length;
  const requiredItems = items.filter(item => item.required);
  const completedRequiredItems = requiredItems.filter(item => item.status === 'completed').length;
  const progress = (completedItems / items.length) * 100;
  const readyToLaunch = requiredItems.every(item => item.status === 'completed');

  const runCheck = async (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: 'in_progress' } : item
    ));

    // Simulate check process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const success = Math.random() > 0.2; // 80% success rate for demo
    
    setItems(prev => prev.map(item => 
      item.id === itemId ? { 
        ...item, 
        status: success ? 'completed' : 'failed' 
      } : item
    ));

    toast({
      title: success ? "Check Completed" : "Check Failed",
      description: success ? "All systems verified" : "Issues detected - please review",
      variant: success ? "default" : "destructive",
    });
  };

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ChecklistItem['status']) => {
    const variants = {
      completed: 'default',
      in_progress: 'secondary',
      failed: 'destructive',
      pending: 'outline',
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getCategoryColor = (category: ChecklistItem['category']) => {
    const colors = {
      system: 'bg-blue-100 text-blue-800',
      security: 'bg-red-100 text-red-800',
      data: 'bg-green-100 text-green-800',
      performance: 'bg-yellow-100 text-yellow-800',
      testing: 'bg-purple-100 text-purple-800',
    };
    return colors[category];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Go-Live Checklist</span>
            <Badge variant={readyToLaunch ? "default" : "secondary"}>
              {readyToLaunch ? "Ready to Launch" : "Preparing"}
            </Badge>
          </CardTitle>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600">
              {completedItems} of {items.length} checks completed 
              ({completedRequiredItems}/{requiredItems.length} required)
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(item.status)}
                  {item.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => runCheck(item.id)}
                      variant="outline"
                    >
                      Run Check
                    </Button>
                  )}
                  {item.status === 'failed' && (
                    <Button
                      size="sm"
                      onClick={() => runCheck(item.id)}
                      variant="outline"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {readyToLaunch && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800">Ready to Launch!</h3>
                  <p className="text-green-600">All required checks have been completed successfully.</p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Go Live
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
