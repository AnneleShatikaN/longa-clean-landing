
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useServices } from '@/contexts/ServiceContext';
import ServiceEditForm from './ServiceEditForm';

interface ServiceEditModalProps {
  serviceId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ServiceEditModal: React.FC<ServiceEditModalProps> = ({ 
  serviceId, 
  isOpen, 
  onClose 
}) => {
  const { getServiceById } = useServices();
  const service = getServiceById(serviceId);

  if (!service) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Not Found</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <p className="text-gray-600">The requested service could not be found.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service: {service.name}</DialogTitle>
        </DialogHeader>
        <ServiceEditForm 
          service={service}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServiceEditModal;
