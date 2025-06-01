
import { useEffect } from 'react';
import { useSessionManagement } from '@/hooks/useSessionManagement';

export const SessionManager = () => {
  useSessionManagement();
  return null;
};
