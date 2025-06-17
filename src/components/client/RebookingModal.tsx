
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface RebookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  serviceId: string;
  providerName?: string;
  serviceName?: string;
}

export const RebookingModal: React.FC<RebookingModalProps> = ({
  isOpen,
  onClose,
  providerId,
  serviceId,
  providerName,
  serviceName
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [instructions, setInstructions] = useState('');
  const navigate = useNavigate();

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleRebook = () => {
    if (!selectedDate || !selectedTime) return;

    // Navigate to booking page with pre-filled data
    const searchParams = new URLSearchParams({
      serviceId,
      providerId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      instructions
    });

    navigate(`/booking?${searchParams.toString()}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Rebook Service
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium">{serviceName}</p>
            {providerName && (
              <p className="text-sm text-gray-600">with {providerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Select Date
            </label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Select Time
            </label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Special Instructions (Optional)
            </label>
            <Textarea
              placeholder="Any special instructions for this booking..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleRebook}
              disabled={!selectedDate || !selectedTime}
              className="flex-1"
            >
              Book Again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
