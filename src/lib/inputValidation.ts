import { z } from 'zod';

// File upload validation schemas
export const uploadFileSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), 'Only JPEG, PNG, and WebP images are allowed'),
  league: z.string().min(1, 'League is required').max(50, 'League name too long'),
  trophyCount: z.number().min(0, 'Trophy count must be positive').max(10000, 'Invalid trophy count').optional(),
});

// Troop management validation schemas
export const troopAdviceSchema = z.object({
  troopId: z.number().int().positive('Troop ID must be a positive integer'),
  leagueId: z.number().int().positive('League ID must be a positive integer'),
  usageCount: z.number().int().min(0, 'Usage count must be non-negative'),
  usagePercentage: z.number().min(0, 'Usage percentage must be non-negative').max(100, 'Usage percentage cannot exceed 100'),
  rank: z.number().int().positive('Rank must be a positive integer'),
});

// Admin action validation
export const adminActionSchema = z.object({
  action: z.string().min(1, 'Action is required').max(100, 'Action description too long'),
  tableName: z.string().max(50, 'Table name too long').optional(),
  recordId: z.string().max(100, 'Record ID too long').optional(),
});

// League validation
export const leagueSchema = z.object({
  name: z.string().min(1, 'League name is required').max(50, 'League name too long'),
  minTrophies: z.number().int().min(0, 'Minimum trophies must be non-negative').optional(),
  maxTrophies: z.number().int().min(0, 'Maximum trophies must be non-negative').optional(),
});

// Rate limiting helpers
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxRequests: number, windowMs: number): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
};

// Validate file type and size
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  try {
    uploadFileSchema.parse({ file, league: 'temp', trophyCount: 0 });
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message || 'Invalid file' };
    }
    return { isValid: false, error: 'File validation failed' };
  }
};