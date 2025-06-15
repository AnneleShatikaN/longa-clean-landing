
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Database, FileText, Ban, Shield, AlertTriangle } from 'lucide-react';
import { useDataMode, DataMode } from '@/contexts/DataModeContext';
import { useToast } from '@/hooks/use-toast';

export const DataModeToggle: React.FC = () => {
  const { dataMode, setDataMode, isLoading, isDevelopmentMode } = useDataMode();
  const { toast } = useToast();

  const handleModeChange = (mode: DataMode) => {
    const previousMode = dataMode;
    setDataMode(mode);
    
    const modeLabels = {
      live: 'Live Data (Supabase)',
      mock: 'Mock Data (JSON)',
      none: 'No Data'
    };

    // Enhanced admin notification
    toast({
      title: "Global Data Mode Changed",
      description: `All users switched from ${modeLabels[previousMode]} to ${modeLabels[mode]}. This affects the entire application.`,
      duration: 5000,
    });

    console.log(`[Admin] Changed global data mode from ${previousMode} to ${mode}`);
  };

  const getModeIcon = (mode: DataMode) => {
    switch (mode) {
      case 'live': return <Database className="h-4 w-4" />;
      case 'mock': return <FileText className="h-4 w-4" />;
      case 'none': return <Ban className="h-4 w-4" />;
    }
  };

  const getModeColor = (mode: DataMode) => {
    switch (mode) {
      case 'live': return 'bg-green-100 text-green-800';
      case 'mock': return 'bg-yellow-100 text-yellow-800';
      case 'none': return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-600" />
          Global Data Source Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Development Mode Warning */}
        {isDevelopmentMode && (
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-xs text-orange-700">Development Mode</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Badge className={getModeColor(dataMode)}>
            {getModeIcon(dataMode)}
            <span className="ml-1">
              {dataMode === 'live' ? 'Live Data' : 
               dataMode === 'mock' ? 'Mock Data' : 
               'No Data'}
            </span>
          </Badge>
          {isLoading && (
            <span className="text-xs text-gray-500">Loading...</span>
          )}
        </div>
        
        <Select value={dataMode} onValueChange={handleModeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select data source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="live">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Live Data (Supabase)
              </div>
            </SelectItem>
            <SelectItem value="mock">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Mock Data (JSON)
              </div>
            </SelectItem>
            <SelectItem value="none">
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4" />
                No Data
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        <div className="text-xs text-gray-500">
          {dataMode === 'live' && 'All users see real data from Supabase database'}
          {dataMode === 'mock' && 'All users see static mock data from JSON files'}
          {dataMode === 'none' && 'All users see empty state - no data loaded'}
        </div>

        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 font-medium">Admin Control</p>
          <p className="text-xs text-blue-600">Changes here affect the entire application for all users.</p>
        </div>
      </CardContent>
    </Card>
  );
};
