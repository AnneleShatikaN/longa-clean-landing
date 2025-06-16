
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiKeyManagement } from './settings/ApiKeyManagement';
import { BankingSetup } from './settings/BankingSetup';
import { SystemConfiguration } from './settings/SystemConfiguration';
import { Key, CreditCard, Settings } from 'lucide-react';

export const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="api-keys" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="api-keys" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="banking" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Banking
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api-keys">
              <ApiKeyManagement />
            </TabsContent>

            <TabsContent value="banking">
              <BankingSetup />
            </TabsContent>

            <TabsContent value="system">
              <SystemConfiguration />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
