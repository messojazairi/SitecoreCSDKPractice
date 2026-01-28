/**
 * Retry Utility for handling transient failures
 */

import { createLogger } from './logger.js';

const logger = createLogger('Retry');

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: Array<string | RegExp>;
  onRetry?: (attempt: number, error: Error) => void;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public attempts: number,
    public lastError: Error
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Check if error is retryable
 */
function isRetryableError(
  error: Error,
  retryableErrors?: Array<string | RegExp>
): boolean {
  if (!retryableErrors || retryableErrors.length === 0) {
    // Default retryable errors
    const defaultRetryable = [
      /timeout/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
      /ECONNREFUSED/i,
      /rate limit/i,
      /429/,
      /502/,
      /503/,
      /504/,
      /401/, // For auth token refresh
    ];

    return defaultRetryable.some((pattern) => {
      if (typeof pattern === 'string') {
        return error.message.includes(pattern);
      }
      return pattern.test(error.message);
    });
  }

  return retryableErrors.some((pattern) => {
    if (typeof pattern === 'string') {
      return error.message.includes(pattern);
    }
    return pattern.test(error.message);
  });
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    retryableErrors,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      logger.debug(`Attempt ${attempt}/${maxAttempts}`);
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      const shouldRetry =
        attempt < maxAttempts && isRetryableError(lastError, retryableErrors);

      if (!shouldRetry) {
        logger.error(`Operation failed (non-retryable)`, lastError);
        throw lastError;
      }

      // Calculate delay
      const delay = calculateDelay(
        attempt,
        initialDelay,
        maxDelay,
        backoffMultiplier
      );

      logger.warn(
        `Attempt ${attempt} failed, retrying in ${delay}ms`,
        { error: lastError.message }
      );

      // Call onRetry callback
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All attempts failed
  throw new RetryError(
    `Operation failed after ${maxAttempts} attempts`,
    maxAttempts,
    lastError!
  );
}

/**
 * Retry with custom retry condition
 */
export async function retryWithCondition<T>(
  operation: () => Promise<T>,
  shouldRetry: (error: Error, attempt: number) => boolean,
  options: Omit<RetryOptions, 'retryableErrors'> = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt >= maxAttempts || !shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      const delay = calculateDelay(
        attempt,
        initialDelay,
        maxDelay,
        backoffMultiplier
      );

      logger.warn(`Retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      await sleep(delay);
    }
  }

  throw new RetryError(
    `Operation failed after ${maxAttempts} attempts`,
    maxAttempts,
    lastError!
  );
}

/**
 * Retry with timeout
 */
export async function retryWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  options: RetryOptions = {}
): Promise<T> {
  return Promise.race([
    retry(operation, options),
    sleep(timeoutMs).then(() => {
      throw new Error(`Operation timed out after ${timeoutMs}ms`);
    }),
  ]);
}

/**
 * Circuit breaker to prevent cascading failures
 */
export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private resetTimeout: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit should reset
    if (
      this.state === 'OPEN' &&
      Date.now() - this.lastFailureTime > this.resetTimeout
    ) {
      logger.info('Circuit breaker transitioning to HALF_OPEN');
      this.state = 'HALF_OPEN';
      this.failures = 0;
    }

    // Reject if circuit is open
    if (this.state === 'OPEN') {
      const error = new Error(
        'Circuit breaker is OPEN - too many failures. Use sitecore_reset_circuit_breaker tool to reset, or wait 30 seconds for automatic recovery.'
      );
      (error as any).circuitBreakerOpen = true;
      throw error;
    }

    try {
      const result = await operation();

      // Success - reset failures and close circuit
      if (this.state === 'HALF_OPEN') {
        logger.info('Circuit breaker transitioning to CLOSED');
        this.state = 'CLOSED';
      }
      // Reset failure count on success (gradual recovery)
      if (this.failures > 0) {
        this.failures = Math.max(0, this.failures - 1);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Don't count certain errors toward circuit breaker failures
      // These are typically validation errors, not API failures
      const nonRetryableErrors = [
        /not found/i,
        /does not exist/i,
        /invalid/i,
        /validation/i,
        /required/i,
        /missing/i,
        /already exists/i,
        /duplicate/i,
      ];
      
      const isNonRetryableError = nonRetryableErrors.some(pattern => 
        pattern.test(errorMessage)
      );
      
      // Only count retryable errors (network, timeout, server errors)
      if (!isNonRetryableError) {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.threshold) {
          logger.error(
            `Circuit breaker OPEN after ${this.failures} failures`,
            error as Error
          );
          this.state = 'OPEN';
        }
      } else {
        logger.debug('Non-retryable error, not counting toward circuit breaker', {
          error: errorMessage,
        });
      }

      throw error;
    }
  }

  getState(): string {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = 0;
    logger.info('Circuit breaker manually reset');
  }
}

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number,
    private refillRate: number // tokens per second
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  async acquire(tokens: number = 1): Promise<void> {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return;
    }

    // Wait until we have enough tokens
    const tokensNeeded = tokens - this.tokens;
    const waitTime = (tokensNeeded / this.refillRate) * 1000;

    logger.debug(`Rate limit - waiting ${waitTime}ms for ${tokens} tokens`);

    await sleep(waitTime);
    this.refill();
    this.tokens -= tokens;
  }

  getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

