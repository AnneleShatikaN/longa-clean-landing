
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Package, User, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePackageBooking } from '@/hooks/usePackageBooking';
import { format } from 'date-fns';

interface PackageBooking {
  id: string;
  client_id: string;
  package_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  scheduled_date: string;
  client: {
    full_name: string;
    email: string;
  };
  package: {
    name: string;
    description: string;
  };
  individual_bookings: Array<{
    id: string;
    service_id: string;
    provider_id?: string;
    status: string;
    provider_payout: number;
    service: {
      name: string;
    };
    provider?: {
      full_name: string;
    };
  }>;
}

export const PackageBookingManager: React.FC = () => {
  const { toast } = useToast();
  const { processPackageBooking, isProcessing } = usePackageBooking();
  const [packageBookings, setPackageBookings] = useState<PackageBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Form state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [clients, setClients] = useState<Array<{id: string, full_name: string, email: string}>>([]);
  const [packages, setPackages] = useState<Array<{id: string, name: string, total_price: number}>>([]);

  const fetchPackageBookings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('package_bookings')
        .select(`
          *,
          client:users!package_bookings_client_id_fkey(full_name, email),
          package:subscription_packages(name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch individual bookings separately
      const packageBookingsWithJobs = await Promise.all(
        (data || []).map(async (booking) => {
          const { data: jobs, error: jobsError } = await supabase
            .from('bookings')
            .select(`
              id,
              service_id,
              provider_id,
              status,
              provider_payout,
              service:services(name),
              provider:users!bookings_provider_id_fkey(full_name)
            `)
            .eq('package_id', booking.id);

          if (jobsError) {
            console.error('Error fetching jobs for package:', jobsError);
            return {
              ...booking,
              individual_bookings: []
            };
          }

          return {
            ...booking,
            individual_bookings: jobs || []
          };
        })
      );

      setPackageBookings(packageBookingsWithJobs);
    } catch (error) {
      console.error('Error fetching package bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch package bookings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('role', 'client')
        .eq('is_active', true);

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Fetch packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('subscription_packages')
        .select('id, name, total_price')
        .eq('is_active', true);

      if (packagesError) throw packagesError;
      setPackages(packagesData || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  useEffect(() => {
    fetchPackageBookings();
    fetchFormData();
  }, []);

  const handleCreatePackageBooking = async () => {
    if (!selectedClientId || !selectedPackageId) {
      toast({
        title: "Error",
        description: "Please select both client and package",
        variant: "destructive"
      });
      return;
    }

    try {
      await processPackageBooking(selectedClientId, selectedPackageId, scheduledDate);
      setIsCreateModalOpen(false);
      setSelectedClientId('');
      setSelectedPackageId('');
      setScheduledDate(new Date().toISOString().split('T')[0]);
      fetchPackageBookings();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Package Booking Management</h2>
          <p className="text-gray-600">Manage package bookings and provider assignments</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Create Package Booking
        </Button>
      </div>

      {/* Package Bookings List */}
      <div className="space-y-4">
        {packageBookings.map((booking) => {
          const assignedJobs = booking.individual_bookings.filter(job => job.provider_id);
          const unassignedJobs = booking.individual_bookings.filter(job => !job.provider_id);
          const completedJobs = booking.individual_bookings.filter(job => job.status === 'completed');
          
          return (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {booking.package.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {booking.client.full_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      N${booking.total_amount.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.individual_bookings.length} jobs
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      <strong>{assignedJobs.length}</strong> assigned
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">
                      <strong>{unassignedJobs.length}</strong> unassigned
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>{completedJobs.length}</strong> completed
                    </span>
                  </div>
                </div>

                {/* Individual Jobs */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Individual Jobs:</h4>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {booking.individual_bookings.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{job.service.name}</span>
                          <Badge variant="outline" className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.provider ? (
                            <span className="text-gray-600">{job.provider.full_name}</span>
                          ) : (
                            <span className="text-red-600">Unassigned</span>
                          )}
                          <span className="font-medium">N${job.provider_payout}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Package Booking Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Package Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client">Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="package">Package</Label>
              <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} (N${pkg.total_price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Scheduled Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleCreatePackageBooking} 
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Create Booking'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
