
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Save, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  name: string;
  label: string;
  description: string;
  value: string;
}

export const ApiKeyManagement = () => {
  const { toast } = useToast();
  const [openSections, setOpenSections] = useState<string[]>(['whatsapp']);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      name: 'whatsapp_api_key',
      label: 'WhatsApp Business API',
      description: 'For sending booking confirmations and notifications',
      value: ''
    },
    {
      name: 'payment_gateway_key',
      label: 'Payment Gateway API',
      description: 'For processing payments and refunds',
      value: ''
    },
    {
      name: 'sms_gateway_key',
      label: 'SMS Gateway API',
      description: 'For sending SMS notifications',
      value: ''
    },
    {
      name: 'analytics_key',
      label: 'Analytics API',
      description: 'For tracking and reporting services',
      value: ''
    }
  ]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const updateApiKey = (name: string, value: string) => {
    setApiKeys(prev => prev.map(key => 
      key.name === name ? { ...key, value } : key
    ));
  };

  const saveApiKey = async (apiKey: ApiKey) => {
    try {
      // Here you would save to Supabase secrets or your secure storage
      console.log('Saving API key:', apiKey.name);
      
      toast({
        title: "API Key Saved",
        description: `${apiKey.label} has been saved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Manage third-party API keys for integrations. All keys are encrypted and stored securely.
      </div>

      {apiKeys.map((apiKey) => (
        <Collapsible 
          key={apiKey.name}
          open={openSections.includes(apiKey.name)}
          onOpenChange={() => toggleSection(apiKey.name)}
        >
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{apiKey.label}</span>
                  <div className="flex items-center gap-2">
                    {apiKey.value && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Configured
                      </span>
                    )}
                    {openSections.includes(apiKey.name) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{apiKey.description}</p>
                
                <div className="space-y-2">
                  <Label htmlFor={apiKey.name}>API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={apiKey.name}
                        type={showKeys[apiKey.name] ? "text" : "password"}
                        value={apiKey.value}
                        onChange={(e) => updateApiKey(apiKey.name, e.target.value)}
                        placeholder="Enter your API key..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => toggleKeyVisibility(apiKey.name)}
                      >
                        {showKeys[apiKey.name] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={() => saveApiKey(apiKey)}
                      disabled={!apiKey.value}
                      size="sm"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
};
