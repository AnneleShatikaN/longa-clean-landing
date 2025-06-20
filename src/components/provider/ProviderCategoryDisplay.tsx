
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ProviderCategoryDisplay: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'provider' || !user.provider_category) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Service Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {user.provider_category}
        </Badge>
        <p className="text-sm text-gray-600 mt-2">
          You can only accept jobs in this category. Contact support to change your category.
        </p>
      </CardContent>
    </Card>
  );
};
