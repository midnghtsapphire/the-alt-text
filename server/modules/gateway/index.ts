import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { getDb } from "../../db";
import { altTextApiKeys, altTextApiLogs } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * API GATEWAY MODULE
 * Centralized API routing, authentication, rate limiting, and security
 */

export interface APIGatewayConfig {
  enableRateLimit: boolean;
  enableCORS: boolean;
  enableHelmet: boolean;
  enableAPIKeyAuth: boolean;
  enableLogging: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

/**
 * API Key Authentication Middleware
 */
export const apiKeyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "API key is required. Include X-API-Key header.",
    });
  }

  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database unavailable" });
    }

    // Validate API key
    const [keyRecord] = await db
      .select()
      .from(altTextApiKeys)
      .where(eq(altTextApiKeys.keyHash, apiKey))
      .limit(1);

    if (!keyRecord) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid API key",
      });
    }

    if (keyRecord.status !== "active") {
      return res.status(403).json({
        error: "Forbidden",
        message: "API key is inactive or revoked",
      });
    }

    // Check rate limits based on plan
    const rateLimitExceeded = await checkRateLimit(
      keyRecord.userId,
      "starter" // TODO: Get plan from subscription
    );

    if (rateLimitExceeded) {
      return res.status(429).json({
        error: "Rate Limit Exceeded",
        message: `You have exceeded your plan rate limit. Upgrade your plan for higher limits.`,
      });
    }

    // Attach user info to request
    (req as any).apiUser = {
      userId: keyRecord.userId,
      planType: "starter", // TODO: Get from subscription
      apiKeyId: keyRecord.id,
    };

    // Log API request
    await logAPIRequest(req, keyRecord.id);

    next();
  } catch (error) {
    console.error("API key auth error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to authenticate API key",
    });
  }
};

/**
 * Check rate limit based on plan type
 */
async function checkRateLimit(
  userId: number,
  planType: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Get request count in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const logs = await db
    .select()
    .from(altTextApiLogs)
    .where(eq(altTextApiLogs.userId, userId));

  const recentLogs = logs.filter(
    (log) => new Date(log.requestedAt) > oneHourAgo
  );

  // Rate limits by plan
  const limits: Record<string, number> = {
    starter: 100,
    professional: 1000,
    enterprise: 999999, // Unlimited
  };

  const limit = limits[planType] || 100;

  return recentLogs.length >= limit;
}

/**
 * Log API request
 */
async function logAPIRequest(req: Request, apiKeyId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const apiUser = (req as any).apiUser;

    await db.insert(altTextApiLogs).values({
      userId: apiUser.userId,
      apiKeyId,
      endpoint: req.path,
      method: req.method,
      statusCode: 200, // Will be updated by response middleware
      responseTime: 0, // Will be updated by response middleware
      requestedAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to log API request:", error);
  }
}

/**
 * Rate limiting middleware factory
 */
export function createRateLimiter(config: RateLimitConfig) {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.maxRequests,
    message: config.message || "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: "Rate Limit Exceeded",
        message: config.message || "Too many requests, please try again later.",
        retryAfter: Math.ceil(config.windowMs / 1000),
      });
    },
  });
}

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow all origins in development
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    // In production, check against whitelist
    const whitelist = [
      "https://thealttext.com",
      "https://www.thealttext.com",
      "https://app.thealttext.com",
    ];

    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
};

/**
 * Helmet security configuration
 */
export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
};

/**
 * Error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("API Error:", err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(500).json({
    error: "Internal Server Error",
    message: isDevelopment ? err.message : "An unexpected error occurred",
    ...(isDevelopment && { stack: err.stack }),
  });
};

/**
 * Request logging middleware
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`
    );
  });

  next();
};

/**
 * API Gateway initialization
 */
export function initializeAPIGateway(app: any, config: APIGatewayConfig) {
  // Security headers
  if (config.enableHelmet) {
    app.use(helmet(helmetOptions));
  }

  // CORS
  if (config.enableCORS) {
    app.use(cors(corsOptions));
  }

  // Request logging
  if (config.enableLogging) {
    app.use(requestLogger);
  }

  // Global rate limiting (per IP)
  if (config.enableRateLimit) {
    app.use(
      "/api",
      createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100, // 100 requests per 15 minutes per IP
        message: "Too many requests from this IP, please try again later.",
      })
    );
  }

  // Error handling
  app.use(errorHandler);

  console.log("✓ API Gateway initialized");
}

/**
 * Plan-specific rate limiters
 */
export const rateLimiters = {
  starter: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    message: "Starter plan: 100 requests per hour exceeded",
  }),
  professional: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
    message: "Professional plan: 1,000 requests per hour exceeded",
  }),
  enterprise: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 999999, // Effectively unlimited
    message: "Enterprise plan rate limit exceeded",
  }),
};

/**
 * USAGE EXAMPLE:
 * 
 * import { initializeAPIGateway, apiKeyAuth } from "./modules/gateway";
 * 
 * // Initialize gateway
 * initializeAPIGateway(app, {
 *   enableRateLimit: true,
 *   enableCORS: true,
 *   enableHelmet: true,
 *   enableAPIKeyAuth: true,
 *   enableLogging: true,
 * });
 * 
 * // Protected API routes
 * app.post("/api/scan", apiKeyAuth, async (req, res) => {
 *   const { userId, planType } = req.apiUser;
 *   // Handle scan request
 * });
 */
