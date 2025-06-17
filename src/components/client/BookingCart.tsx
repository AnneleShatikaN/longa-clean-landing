
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Trash2, Plus, DollarSign, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  duration: number;
  bookingDate: string;
  bookingTime: string;
  location: string;
  specialInstructions?: string;
}

interface BookingCartProps {
  cartItems: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onProceedToPayment: () => void;
}

export const BookingCart = ({ cartItems, onRemoveItem, onClearCart, onProceedToPayment }: BookingCartProps) => {
  const navigate = useNavigate();
  
  const totalAmount = cartItems.reduce((sum, item) => sum + item.servicePrice, 0);
  const totalDuration = cartItems.reduce((sum, item) => sum + item.duration, 0);

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your Cart is Empty</h3>
          <p className="text-gray-600 mb-6">Add services to your cart to book multiple services at once.</p>
          <Button onClick={() => navigate('/search')}>
            Browse Services
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Booking Cart ({cartItems.length} service{cartItems.length !== 1 ? 's' : ''})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium">{item.serviceName}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>📅 {item.bookingDate} at {item.bookingTime}</div>
                <div>📍 {item.location}</div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{Math.floor(item.duration / 60)}h {item.duration % 60}m</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">N${item.servicePrice}</div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemoveItem(item.id)}
                className="mt-1 text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Total Duration:</span>
            <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Amount:</span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-5 w-5" />
              N${totalAmount}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClearCart}
            className="flex-1"
          >
            Clear Cart
          </Button>
          <Button
            onClick={onProceedToPayment}
            className="flex-1 bg-blue-900 hover:bg-blue-800"
          >
            Proceed to Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
