
import DOMPurify from 'dompurify';

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
};

// Data masking utilities
export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) return email;
  
  const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
  return `${maskedLocal}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  // For Namibian numbers (+264 XX XXX XXXX)
  if (phone.startsWith('+264')) {
    return `+264 XX XXX ${phone.slice(-4)}`;
  }
  // For local numbers
  if (phone.length >= 8) {
    return `XXX XXX ${phone.slice(-4)}`;
  }
  return phone;
};

export const maskBankAccount = (accountNumber: string): string => {
  if (accountNumber.length <= 4) return accountNumber;
  return `****${accountNumber.slice(-4)}`;
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Password must be at least 8 characters long');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include at least one uppercase letter');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include at least one lowercase letter');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include at least one number');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Include at least one special character');

  return {
    isValid: score >= 4,
    score,
    feedback
  };
};

// Session management
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
export const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute

export const getLastActivity = (): number => {
  return parseInt(localStorage.getItem('longa_last_activity') || '0');
};

export const updateLastActivity = (): void => {
  localStorage.setItem('longa_last_activity', Date.now().toString());
};

export const isSessionExpired = (): boolean => {
  const lastActivity = getLastActivity();
  return Date.now() - lastActivity > SESSION_TIMEOUT;
};

// Rate limiting simulation
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const checkRateLimit = (key: string, maxRequests: number, windowMs: number): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
};

// Fraud detection patterns
export const detectSuspiciousActivity = (activity: {
  userId: string; // Changed from number to string
  action: string;
  timestamp: number;
  metadata?: Record<string, any>;
}): { isSuspicious: boolean; reasons: string[] } => {
  const reasons: string[] = [];

  // Multiple login attempts in short time
  const recentLogins = getRecentActivities(activity.userId, 'login', 5 * 60 * 1000);
  if (recentLogins.length > 3) {
    reasons.push('Multiple login attempts detected');
  }

  // Unusual booking patterns
  if (activity.action === 'booking' && activity.metadata) {
    const amount = activity.metadata.amount;
    if (amount > 2000) {
      reasons.push('High-value booking detected');
    }
  }

  // Geographic inconsistencies would be checked here in a real implementation

  return {
    isSuspicious: reasons.length > 0,
    reasons
  };
};

const getRecentActivities = (userId: string, action: string, timeWindow: number): any[] => {
  // In a real app, this would query the database
  const activities = JSON.parse(localStorage.getItem(`longa_activities_${userId}`) || '[]');
  const cutoff = Date.now() - timeWindow;
  
  return activities.filter((activity: any) => 
    activity.action === action && activity.timestamp > cutoff
  );
};

// Log security events
export const logSecurityEvent = (event: {
  type: 'login' | 'logout' | 'failed_login' | 'suspicious_activity' | 'admin_action';
  userId?: string; // Changed from number to string
  details: Record<string, any>;
}): void => {
  const securityLog = JSON.parse(localStorage.getItem('longa_security_log') || '[]');
  
  securityLog.push({
    ...event,
    timestamp: Date.now(),
    id: Date.now().toString()
  });

  // Keep only last 1000 entries
  if (securityLog.length > 1000) {
    securityLog.splice(0, securityLog.length - 1000);
  }

  localStorage.setItem('longa_security_log', JSON.stringify(securityLog));
};
