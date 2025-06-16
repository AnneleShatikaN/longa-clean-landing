
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import { useToast } from '@/hooks/use-toast';
import { Calendar, DollarSign, Percent } from 'lucide-react';

export const WeekendSettings: React.FC = () => {
  const { settings, updateSetting, isLoading } = useGlobalSettings();
  const { toast } = useToast();
  
  const [weekendMarkup, setWeekendMarkup] = useState(
    settings.weekend_client_markup_percentage || 20
  );
  const [weekendBonus, setWeekendBonus] = useState(
    settings.weekend_provider_bonus_amount || 50
  );
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setWeekendMarkup(settings.weekend_client_markup_percentage || 20);
    setWeekendBonus(settings.weekend_provider_bonus_amount || 50);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const markupSuccess = await updateSetting('weekend_client_markup_percentage', weekendMarkup);
      const bonusSuccess = await updateSetting('weekend_provider_bonus_amount', weekendBonus);

      if (markupSuccess && bonusSuccess) {
        toast({
          title: "Settings Updated",
          description: "Weekend pricing settings have been saved successfully.",
          className: "border-green-200 bg-green-50",
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update weekend settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekend Pricing Settings
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configure special pricing for weekend jobs (Saturday & Sunday)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Weekend Markup */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-blue-600" />
              <Label htmlFor="weekend-markup">Weekend Client Markup (%)</Label>
            </div>
            <Input
              id="weekend-markup"
              type="number"
              min="0"
              max="100"
              step="1"
              value={weekendMarkup}
              onChange={(e) => setWeekendMarkup(Number(e.target.value))}
              placeholder="20"
            />
            <p className="text-xs text-gray-500">
              Extra percentage charged to clients for weekend bookings
            </p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Example:</strong> If a service costs N$100, weekend price will be N${(100 * (1 + weekendMarkup / 100)).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Provider Weekend Bonus */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <Label htmlFor="weekend-bonus">Provider Weekend Bonus (NAD)</Label>
            </div>
            <Input
              id="weekend-bonus"
              type="number"
              min="0"
              step="5"
              value={weekendBonus}
              onChange={(e) => setWeekendBonus(Number(e.target.value))}
              placeholder="50"
            />
            <p className="text-xs text-gray-500">
              Fixed bonus amount added to provider payout for weekend jobs
            </p>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Weekend Bonus:</strong> +N${weekendBonus} for Saturday & Sunday jobs
              </p>
            </div>
          </div>
        </div>

        {/* Weekend Detection Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Weekend Detection</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline">Saturday</Badge>
            <Badge variant="outline">Sunday</Badge>
            <Badge variant="secondary">Namibian Timezone</Badge>
          </div>
          <p className="text-sm text-gray-600">
            Weekend jobs are automatically detected based on the booking date in Namibian timezone (Africa/Windhoek).
            Both pricing markup and provider bonus are applied automatically.
          </p>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="min-w-[120px]"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
