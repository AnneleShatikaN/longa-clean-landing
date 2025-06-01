
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation, Clock, MapPin, Route, Car } from 'lucide-react';
import { calculateDistance, formatNAD } from '@/utils/locationUtils';
import { useBookings } from '@/contexts/BookingContext';

interface RouteStop {
  id: number;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  estimatedDuration: number;
  serviceTime: number;
  clientName: string;
  serviceName: string;
  amount: number;
  priority: 'high' | 'medium' | 'low';
}

interface RouteOptimizerProps {
  providerId: number;
  date: string;
}

export const RouteOptimizer: React.FC<RouteOptimizerProps> = ({
  providerId,
  date
}) => {
  const { getBookingsByProvider } = useBookings();
  const [route, setRoute] = useState<RouteStop[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<RouteStop[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [travelCost, setTravelCost] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const TRAVEL_RATE_PER_KM = 5; // NAD per kilometer

  useEffect(() => {
    loadDayBookings();
  }, [providerId, date]);

  const loadDayBookings = () => {
    const bookings = getBookingsByProvider(providerId).filter(
      booking => booking.date === date && 
      ['accepted', 'in-progress'].includes(booking.status)
    );

    // Convert bookings to route stops
    const stops: RouteStop[] = bookings.map(booking => ({
      id: booking.id,
      address: `${booking.clientName} - ${booking.serviceName}`,
      coordinates: {
        lat: -22.5609 + (Math.random() - 0.5) * 0.1, // Simulate coordinates
        lng: 17.0658 + (Math.random() - 0.5) * 0.1
      },
      estimatedDuration: booking.duration || 60,
      serviceTime: booking.duration || 60,
      clientName: booking.clientName,
      serviceName: booking.serviceName,
      amount: booking.amount,
      priority: booking.emergencyBooking ? 'high' : 'medium'
    }));

    setRoute(stops);
  };

  const optimizeRoute = async () => {
    setIsOptimizing(true);
    
    try {
      // Simulate route optimization algorithm
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simple nearest neighbor algorithm for demonstration
      const optimized = [...route];
      const startPoint = { lat: -22.5609, lng: 17.0658 }; // Provider's base location
      
      // Sort by priority first, then by distance
      optimized.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        const distanceA = calculateDistance(
          startPoint.lat, startPoint.lng, 
          a.coordinates.lat, a.coordinates.lng
        );
        const distanceB = calculateDistance(
          startPoint.lat, startPoint.lng, 
          b.coordinates.lat, b.coordinates.lng
        );
        
        return distanceA - distanceB;
      });
      
      setOptimizedRoute(optimized);
      calculateRouteMetrics(optimized);
      
    } catch (error) {
      console.error('Route optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const calculateRouteMetrics = (routeStops: RouteStop[]) => {
    let distance = 0;
    let time = 0;
    const startPoint = { lat: -22.5609, lng: 17.0658 };
    
    let currentPoint = startPoint;
    
    routeStops.forEach((stop, index) => {
      // Calculate distance to this stop
      const distanceToStop = calculateDistance(
        currentPoint.lat, currentPoint.lng,
        stop.coordinates.lat, stop.coordinates.lng
      );
      
      distance += distanceToStop;
      time += (distanceToStop / 40) * 60; // Assume 40km/h average speed, convert to minutes
      time += stop.serviceTime; // Add service time
      
      currentPoint = stop.coordinates;
    });
    
    // Add return trip to base
    if (routeStops.length > 0) {
      const returnDistance = calculateDistance(
        currentPoint.lat, currentPoint.lng,
        startPoint.lat, startPoint.lng
      );
      distance += returnDistance;
      time += (returnDistance / 40) * 60;
    }
    
    setTotalDistance(distance);
    setTotalTime(time);
    setTravelCost(distance * TRAVEL_RATE_PER_KM);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Route Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Route className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Distance</span>
            </div>
            <div className="text-2xl font-bold">{totalDistance.toFixed(1)} km</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Time</span>
            </div>
            <div className="text-2xl font-bold">{formatTime(totalTime)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Travel Cost</span>
            </div>
            <div className="text-2xl font-bold">{formatNAD(travelCost)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Stops</span>
            </div>
            <div className="text-2xl font-bold">{route.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Route Optimization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Route Optimization</CardTitle>
            <Button 
              onClick={optimizeRoute}
              disabled={isOptimizing || route.length === 0}
            >
              <Navigation className="h-4 w-4 mr-2" />
              {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {route.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bookings scheduled for {date}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Route */}
              <div>
                <h4 className="font-medium mb-3">Current Order</h4>
                <div className="space-y-2">
                  {route.map((stop, index) => (
                    <div key={stop.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{stop.clientName}</div>
                        <div className="text-sm text-gray-600">{stop.serviceName}</div>
                        <div className="text-sm text-gray-500">{formatTime(stop.serviceTime)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNAD(stop.amount)}</div>
                        <Badge variant={getPriorityColor(stop.priority)} className="mt-1">
                          {stop.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimized Route */}
              {optimizedRoute.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-green-600">Optimized Route</h4>
                  <div className="space-y-2">
                    {optimizedRoute.map((stop, index) => (
                      <div key={stop.id} className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
                        <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{stop.clientName}</div>
                          <div className="text-sm text-gray-600">{stop.serviceName}</div>
                          <div className="text-sm text-gray-500">{formatTime(stop.serviceTime)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatNAD(stop.amount)}</div>
                          <Badge variant={getPriorityColor(stop.priority)} className="mt-1">
                            {stop.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Instructions */}
      {optimizedRoute.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Turn-by-Turn Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">Start from your base location</div>
                  <div className="text-sm text-gray-600">Begin your route</div>
                </div>
              </div>
              
              {optimizedRoute.map((stop, index) => (
                <div key={stop.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">Visit {stop.clientName}</div>
                    <div className="text-sm text-gray-600">{stop.serviceName}</div>
                    <div className="text-sm text-gray-500">
                      Estimated service time: {formatTime(stop.serviceTime)}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">Return to base</div>
                  <div className="text-sm text-gray-600">End of route</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RouteOptimizer;
