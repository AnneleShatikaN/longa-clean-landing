
import { useToast } from "@/hooks/use-toast";

export const useNotification = () => {
  const { toast } = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
      duration: 3000,
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
      duration: 5000,
    });
  };

  const showLoading = (title: string, description?: string) => {
    return toast({
      title,
      description,
      duration: 10000,
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
      duration: 4000,
    });
  };

  return {
    showSuccess,
    showError,
    showLoading,
    showInfo,
  };
};
