import crypto from 'crypto';

/**
 * P0 Security Utilities
 * Implements critical security fixes identified by multi-LLM analysis
 */

/**
 * Hash API keys before storing in database
 * Uses SHA-256 for one-way hashing
 */
export function hashAPIKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Generate secure random API key
 * Returns 32-character hex string
 */
export function generateAPIKey(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Sanitize user input to prevent XSS and SQL injection
 * Removes dangerous characters and HTML tags
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/['"]/g, '') // Remove quotes to prevent SQL injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick, onload, etc.)
    .trim();
}

/**
 * Sanitize email input
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeInput(email);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized.toLowerCase();
}

/**
 * Sanitize URL input
 * Validates and sanitizes URLs
 */
export function sanitizeURL(url: string): string {
  const sanitized = sanitizeInput(url);
  
  try {
    const parsed = new URL(sanitized);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    return parsed.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Rate limiting store (in-memory for now, should use Redis in production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit for an identifier (IP address, user ID, API key)
 * Returns true if rate limit exceeded
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute default
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return false;
  }

  if (record.count >= maxRequests) {
    return true; // Rate limit exceeded
  }

  // Increment count
  record.count++;
  return false;
}

/**
 * Clean up expired rate limit records (should be called periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((record, key) => {
    if (now > record.resetTime) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

// Clean up every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

/**
 * Safe error response (doesn't expose stack traces)
 */
export function safeErrorResponse(error: unknown): { message: string; code: string } {
  if (error instanceof Error) {
    // Log full error server-side
    console.error('Error:', error);
    
    // Return safe message to client
    return {
      message: 'An error occurred. Please try again later.',
      code: 'INTERNAL_ERROR'
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
}
