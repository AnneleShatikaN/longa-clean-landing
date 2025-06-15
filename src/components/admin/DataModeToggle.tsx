
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Database, FileText, Ban } from 'lucide-react';
import { useDataMode, DataMode } from '@/contexts/DataModeContext';
import { useToast } from '@/hooks/use-toast';

export const DataModeToggle: React.FC = () => {
  const { dataMode, setDataMode, isLoading } = useDataMode();
  const { toast } = useToast();

  const handleModeChange = (mode: DataMode) => {
    setDataMode(mode);
    
    const modeLabels = {
      live: 'Live Data (Supabase)',
      mock: 'Mock Data (JSON)',
      none: 'No Data'
    };

    toast({
      title: "Data Mode Changed",
      description: `Switched to ${modeLabels[mode]}`,
    });
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
        <CardTitle className="text-sm font-medium">Data Source</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
          {dataMode === 'live' && 'Fetching real data from Supabase database'}
          {dataMode === 'mock' && 'Using static mock data from JSON file'}
          {dataMode === 'none' && 'No data loaded - empty state'}
        </div>
      </CardContent>
    </Card>
  );
};
