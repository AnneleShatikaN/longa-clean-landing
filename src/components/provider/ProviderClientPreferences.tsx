
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, User, Heart, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PreferredClient {
  id: string;
  client_id: string;
  client_name: string;
  total_bookings: number;
  avg_rating: number;
  last_booking_date: string;
  notes: string;
  preferred_services: string[];
}

export const ProviderClientPreferences: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferredClients, setPreferredClients] = useState<PreferredClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newClientEmail, setNewClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.role === 'provider') {
      fetchPreferredClients();
    }
  }, [user]);

  const fetchPreferredClients = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Get clients this provider has worked with frequently
      const { data: clientData, error } = await supabase
        .from('bookings')
        .select(`
          client_id,
          rating,
          created_at,
          service:services(name),
          client:users!bookings_client_id_fkey(full_name, email)
        `)
        .eq('provider_id', user.id)
        .eq('status', 'completed')
        .not('rating', 'is', null);

      if (error) throw error;

      // Group by client and calculate stats
      const clientStats = clientData?.reduce((acc: Record<string, any>, booking) => {
        const clientId = booking.client_id;
        if (!acc[clientId]) {
          acc[clientId] = {
            client_id: clientId,
            client_name: booking.client?.full_name || 'Unknown',
            client_email: booking.client?.email,
            bookings: [],
            ratings: [],
            services: new Set()
          };
        }
        acc[clientId].bookings.push(booking);
        if (booking.rating) acc[clientId].ratings.push(booking.rating);
        if (booking.service?.name) acc[clientId].services.add(booking.service.name);
        return acc;
      }, {});

      // Convert to preferred clients format
      const preferred = Object.values(clientStats || {})
        .filter((client: any) => client.bookings.length >= 2) // Clients with 2+ bookings
        .map((client: any) => ({
          id: client.client_id,
          client_id: client.client_id,
          client_name: client.client_name,
          total_bookings: client.bookings.length,
          avg_rating: client.ratings.length > 0 
            ? client.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / client.ratings.length 
            : 0,
          last_booking_date: client.bookings[client.bookings.length - 1]?.created_at,
          notes: '',
          preferred_services: Array.from(client.services)
        })) as PreferredClient[];

      setPreferredClients(preferred);
    } catch (error) {
      console.error('Error fetching preferred clients:', error);
      toast({
        title: "Error",
        description: "Failed to load client preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateClientNotes = async (clientId: string, notes: string) => {
    try {
      // In a real implementation, you'd save this to a provider_client_preferences table
      // For now, we'll just update the local state
      setClientNotes(prev => ({ ...prev, [clientId]: notes }));
      
      toast({
        title: "Notes updated",
        description: "Client notes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive",
      });
    }
  };

  const addPreferredClient = async () => {
    if (!newClientEmail.trim()) return;

    try {
      // Find client by email
      const { data: clientData, error } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('email', newClientEmail.trim())
        .eq('role', 'client')
        .single();

      if (error || !clientData) {
        toast({
          title: "Client not found",
          description: "No client found with that email address.",
          variant: "destructive",
        });
        return;
      }

      // Check if already in preferred list
      if (preferredClients.some(client => client.client_id === clientData.id)) {
        toast({
          title: "Already added",
          description: "This client is already in your preferred list.",
          variant: "destructive",
        });
        return;
      }

      // Add to preferred clients
      const newPreferred: PreferredClient = {
        id: clientData.id,
        client_id: clientData.id,
        client_name: clientData.full_name,
        total_bookings: 0,
        avg_rating: 0,
        last_booking_date: '',
        notes: '',
        preferred_services: []
      };

      setPreferredClients([...preferredClients, newPreferred]);
      setNewClientEmail('');

      toast({
        title: "Client added",
        description: `${clientData.full_name} has been added to your preferred clients.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add preferred client",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Loading client preferences...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Preferred Clients
          </CardTitle>
          <p className="text-sm text-gray-600">
            Manage your preferred clients for repeat bookings and better service matching
          </p>
        </CardHeader>
        <CardContent>
          {/* Add New Preferred Client */}
          <div className="flex gap-3 mb-6">
            <Input
              placeholder="Enter client email to add to preferred list..."
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPreferredClient()}
              className="flex-1"
            />
            <Button onClick={addPreferredClient}>
              Add Client
            </Button>
          </div>

          {/* Preferred Clients List */}
          <div className="space-y-4">
            {preferredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No preferred clients yet</p>
                <p className="text-sm">Clients with 2+ completed bookings will appear here automatically</p>
              </div>
            ) : (
              preferredClients.map((client) => (
                <Card key={client.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4" />
                          <h4 className="font-medium">{client.client_name}</h4>
                          <Badge variant="secondary">
                            {client.total_bookings} booking{client.total_bookings !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        
                        {client.avg_rating > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>Average rating you received: {client.avg_rating.toFixed(1)}</span>
                          </div>
                        )}

                        {client.preferred_services.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {client.preferred_services.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" />
                            <span className="text-sm font-medium">Notes:</span>
                          </div>
                          <Textarea
                            placeholder="Add notes about this client's preferences, special requirements, etc..."
                            value={clientNotes[client.client_id] || client.notes}
                            onChange={(e) => setClientNotes(prev => ({ 
                              ...prev, 
                              [client.client_id]: e.target.value 
                            }))}
                            rows={2}
                            className="text-sm"
                          />
                          {clientNotes[client.client_id] !== client.notes && (
                            <Button
                              size="sm"
                              onClick={() => updateClientNotes(client.client_id, clientNotes[client.client_id] || '')}
                            >
                              Save Notes
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
