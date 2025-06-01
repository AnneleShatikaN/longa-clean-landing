
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LucideIcon } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon: Icon,
  isLoading = false
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            {Icon && <Icon className="h-5 w-5 mr-2" />}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isLoading ? 'Processing...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Hook for managing confirmation dialogs
export const useConfirmation = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Omit<ConfirmationDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>>({
    title: '',
    description: ''
  });
  const resolveRef = React.useRef<(value: boolean) => void>();

  const confirm = (options: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>): Promise<boolean> => {
    setConfig(options);
    setIsOpen(true);
    
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    resolveRef.current?.(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef.current?.(true);
  };

  const ConfirmationComponent = () => (
    <ConfirmationDialog
      {...config}
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );

  return { confirm, ConfirmationComponent };
};
