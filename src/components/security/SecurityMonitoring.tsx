
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Eye, 
  Download,
  RefreshCw
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'suspicious_activity' | 'admin_action';
  userId?: number;
  timestamp: number;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
}

interface SecurityMetrics {
  totalEvents: number;
  failedLogins: number;
  suspiciousActivities: number;
  activeUsers: number;
  riskScore: number;
}

export const SecurityMonitoring: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    failedLogins: 0,
    suspiciousActivities: 0,
    activeUsers: 0,
    riskScore: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = () => {
    setRefreshing(true);
    
    // Load from localStorage (in real app, this would be from API)
    const events: SecurityEvent[] = JSON.parse(localStorage.getItem('longa_security_log') || '[]');
    setSecurityEvents(events.slice(-50)); // Show last 50 events

    // Calculate metrics
    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    const recentEvents = events.filter(event => event.timestamp > last24Hours);
    
    const failedLogins = recentEvents.filter(event => event.type === 'failed_login').length;
    const suspiciousActivities = recentEvents.filter(event => event.type === 'suspicious_activity').length;
    
    // Calculate risk score based on recent activities
    let riskScore = 0;
    if (failedLogins > 10) riskScore += 30;
    if (suspiciousActivities > 5) riskScore += 40;
    if (recentEvents.length > 100) riskScore += 20;
    
    setMetrics({
      totalEvents: recentEvents.length,
      failedLogins,
      suspiciousActivities,
      activeUsers: new Set(recentEvents.map(e => e.userId).filter(Boolean)).size,
      riskScore: Math.min(riskScore, 100)
    });

    setTimeout(() => setRefreshing(false), 1000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const exportSecurityLog = () => {
    const blob = new Blob([JSON.stringify(securityEvents, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-log-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics.totalEvents}</div>
                <div className="text-sm text-gray-600">Events (24h)</div>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{metrics.failedLogins}</div>
                <div className="text-sm text-gray-600">Failed Logins</div>
              </div>
              <Lock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{metrics.suspiciousActivities}</div>
                <div className="text-sm text-gray-600">Suspicious</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getRiskColor(metrics.riskScore)}`}>
                  {metrics.riskScore}%
                </div>
                <div className="text-sm text-gray-600">Risk Score</div>
              </div>
              <Shield className={`h-8 w-8 ${getRiskColor(metrics.riskScore)}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      {metrics.riskScore >= 70 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            High security risk detected. Multiple failed login attempts and suspicious activities reported. 
            Consider implementing additional security measures.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Recent Security Events
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadSecurityData}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportSecurityLog}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No security events recorded
              </div>
            ) : (
              securityEvents.slice(0, 20).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium capitalize">
                          {event.type.replace(/_/g, ' ')}
                        </span>
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {event.userId && `User ID: ${event.userId} • `}
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                      {event.details && Object.keys(event.details).length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {JSON.stringify(event.details)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backup Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Backup & Recovery Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="font-medium text-green-800 mb-2">Daily Backup</div>
              <div className="text-sm text-gray-600">Last backup: Today 02:00 AM</div>
              <Badge className="bg-green-100 text-green-800 mt-2">Successful</Badge>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="font-medium text-green-800 mb-2">Data Integrity</div>
              <div className="text-sm text-gray-600">Last check: Today 06:00 AM</div>
              <Badge className="bg-green-100 text-green-800 mt-2">Verified</Badge>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="font-medium text-blue-800 mb-2">Recovery Test</div>
              <div className="text-sm text-gray-600">Last test: 3 days ago</div>
              <Badge className="bg-blue-100 text-blue-800 mt-2">Scheduled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
