
/**
 * Security utilities for input validation and sanitization
 */

// Maximum allowed text length for translation inputs
export const MAX_TEXT_LENGTH = 5000;

// Rate limiting configuration
export const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
};

/**
 * Validates and sanitizes text input
 */
export const validateAndSanitizeText = (text: string): { 
  isValid: boolean; 
  sanitizedText: string; 
  error?: string; 
} => {
  if (!text || typeof text !== 'string') {
    return {
      isValid: false,
      sanitizedText: '',
      error: 'Invalid input provided'
    };
  }

  // Check length
  if (text.length > MAX_TEXT_LENGTH) {
    return {
      isValid: false,
      sanitizedText: '',
      error: `Text length exceeds maximum of ${MAX_TEXT_LENGTH} characters`
    };
  }

  // Basic sanitization - remove potentially harmful characters
  const sanitizedText = text
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();

  return {
    isValid: true,
    sanitizedText,
  };
};

/**
 * Simple rate limiting implementation using localStorage
 */
export const checkRateLimit = (): { 
  allowed: boolean; 
  resetTime?: number; 
} => {
  const now = Date.now();
  const key = 'translation_requests';
  
  try {
    const stored = localStorage.getItem(key);
    const requests = stored ? JSON.parse(stored) : [];
    
    // Filter out requests older than the window
    const recentRequests = requests.filter(
      (timestamp: number) => now - timestamp < RATE_LIMIT.windowMs
    );
    
    if (recentRequests.length >= RATE_LIMIT.maxRequests) {
      const oldestRequest = Math.min(...recentRequests);
      const resetTime = oldestRequest + RATE_LIMIT.windowMs;
      
      return {
        allowed: false,
        resetTime,
      };
    }
    
    // Add current request and update storage
    recentRequests.push(now);
    localStorage.setItem(key, JSON.stringify(recentRequests));
    
    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // If localStorage fails, allow the request but log the error
    return { allowed: true };
  }
};

/**
 * Generates safe error messages that don't expose internal details
 */
export const createSafeErrorMessage = (error: unknown): string => {
  // Generic error messages that don't expose internal implementation
  const safeMessages = {
    network: 'Unable to connect to translation service. Please check your internet connection.',
    rateLimit: 'Too many requests. Please wait a moment before trying again.',
    validation: 'Please check your input and try again.',
    general: 'An unexpected error occurred. Please try again.',
  };

  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return safeMessages.network;
    }
    if (error.message.includes('rate')) {
      return safeMessages.rateLimit;
    }
    if (error.message.includes('validation')) {
      return safeMessages.validation;
    }
  }

  return safeMessages.general;
};
