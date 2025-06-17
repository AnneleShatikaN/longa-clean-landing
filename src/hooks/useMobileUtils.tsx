
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useMobileUtils = () => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You are offline",
        description: "Some features may not work properly",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Vibration for feedback
  const vibrate = (pattern: number | number[] = 100) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Voice notifications (basic implementation)
  const speakNotification = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // Touch feedback
  const handleTouchFeedback = () => {
    vibrate(50);
  };

  return {
    isOnline,
    vibrate,
    speakNotification,
    handleTouchFeedback
  };
};
