
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Shield, CheckCircle } from 'lucide-react';
import { useDataMode } from '@/contexts/DataModeContext';

export const DataModeToggle: React.FC = () => {
  const { dataMode, isLoading, isDevelopmentMode } = useDataMode();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-600" />
          Application Data Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            <Database className="h-4 w-4" />
            <span className="ml-1">Live Data</span>
          </Badge>
          {isLoading && (
            <span className="text-xs text-gray-500">Loading...</span>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          Application is configured to use live data from Supabase database only
        </div>

        <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Production Ready
          </p>
          <p className="text-xs text-blue-600">All data operations use the live Supabase database.</p>
        </div>

        {isDevelopmentMode && (
          <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs text-orange-700">Development Mode Active</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
