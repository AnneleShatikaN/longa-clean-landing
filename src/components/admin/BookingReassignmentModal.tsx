
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Star, 
  MapPin, 
  Phone, 
  Search, 
  UserX, 
  UserCheck, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface Provider {
  id: string;
  full_name: string;
  rating: number;
  total_jobs: number;
  phone?: string;
  current_work_location?: string;
  is_available: boolean;
}

interface BookingReassignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onReassignmentComplete: () => void;
}

export const BookingReassignmentModal: React.FC<BookingReassignmentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onReassignmentComplete
}) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [reassignmentReason, setReassignmentReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      fetchAvailableProviders();
    }
  }, [isOpen, booking]);

  useEffect(() => {
    filterProviders();
  }, [providers, searchTerm, locationFilter, availabilityFilter]);

  const fetchAvailableProviders = async () => {
    setIsLoadingProviders(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, rating, total_jobs, phone, current_work_location, is_available')
        .eq('role', 'provider')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error",
        description: "Failed to load available providers",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const filterProviders = () => {
    let filtered = providers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(provider =>
        provider.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.phone?.includes(searchTerm)
      );
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(provider => 
        provider.current_work_location === locationFilter
      );
    }

    // Availability filter
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(provider => provider.is_available);
    } else if (availabilityFilter === 'unavailable') {
      filtered = filtered.filter(provider => !provider.is_available);
    }

    // Exclude current provider if assigned
    if (booking?.provider_id) {
      filtered = filtered.filter(provider => provider.id !== booking.provider_id);
    }

    setFilteredProviders(filtered);
  };

  const handleReassignment = async () => {
    if (!selectedProvider || !reassignmentReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a provider and provide a reason for reassignment",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update the booking with new provider
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          provider_id: selectedProvider,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      // Log the reassignment
      const { error: assignmentError } = await supabase
        .from('booking_assignments')
        .insert({
          booking_id: booking.id,
          provider_id: selectedProvider,
          assignment_reason: reassignmentReason,
          auto_assigned: false
        });

      if (assignmentError) console.warn('Assignment logging failed:', assignmentError);

      toast({
        title: "Booking Reassigned",
        description: "Provider has been successfully reassigned and notifications sent",
      });

      onReassignmentComplete();
      onClose();
    } catch (error: any) {
      console.error('Error reassigning booking:', error);
      toast({
        title: "Reassignment Failed",
        description: error.message || "Failed to reassign booking",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Reassign Provider - {booking.service?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Assignment */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Current Assignment
            </h3>
            <div className="space-y-2">
              <p><strong>Current Provider:</strong> {booking.provider?.full_name || 'Unassigned'}</p>
              <p><strong>Booking Date:</strong> {booking.booking_date} at {booking.booking_time}</p>
              <p><strong>Location:</strong> {booking.location_town}</p>
              <p><strong>Status:</strong> 
                <Badge className="ml-2" variant={booking.status === 'accepted' ? 'default' : 'secondary'}>
                  {booking.status}
                </Badge>
              </p>
            </div>
          </div>

          {/* Reassignment Reason */}
          <div className="space-y-2">
            <Label htmlFor="reassignment_reason" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Reason for Reassignment *
            </Label>
            <Textarea
              id="reassignment_reason"
              value={reassignmentReason}
              onChange={(e) => setReassignmentReason(e.target.value)}
              placeholder="Explain why this booking needs to be reassigned..."
              rows={3}
              required
            />
          </div>

          {/* Provider Search and Filters */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="windhoek">Windhoek</SelectItem>
                  <SelectItem value="walvis_bay">Walvis Bay</SelectItem>
                  <SelectItem value="swakopmund">Swakopmund</SelectItem>
                  <SelectItem value="oshakati">Oshakati</SelectItem>
                  <SelectItem value="rundu">Rundu</SelectItem>
                </SelectContent>
              </Select>

              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="available">Available Only</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Select New Provider *
            </Label>

            {isLoadingProviders ? (
              <div className="text-center py-8">Loading providers...</div>
            ) : filteredProviders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No providers found matching your criteria
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
                {filteredProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedProvider === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{provider.full_name}</h4>
                          <div className="flex items-center gap-1">
                            <Star className={`h-3 w-3 ${getRatingColor(provider.rating)}`} />
                            <span className={`text-sm ${getRatingColor(provider.rating)}`}>
                              {provider.rating.toFixed(1)}
                            </span>
                          </div>
                          {provider.is_available ? (
                            <Badge variant="default" className="text-xs">Available</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Busy</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-4">
                            <span>{provider.total_jobs} jobs completed</span>
                            {provider.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {provider.phone}
                              </span>
                            )}
                            {provider.current_work_location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {provider.current_work_location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {selectedProvider === provider.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleReassignment} 
              disabled={isLoading || !selectedProvider || !reassignmentReason.trim()}
            >
              <UserX className="h-4 w-4 mr-2" />
              {isLoading ? 'Reassigning...' : 'Reassign Provider'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
