/**
 * Logging Utility for Sitecore MCP Server
 * Logs to stderr to avoid interfering with MCP protocol (stdout)
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  category: string;
  message: string;
  data?: any;
  error?: Error;
}

export class Logger {
  private static instance: Logger;
  private level: LogLevel;
  private enableColors: boolean;
  private logHistory: LogEntry[] = [];
  private maxHistorySize: number = 1000;

  private constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
    this.enableColors = process.stderr.isTTY;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      const level = process.env.LOG_LEVEL
        ? LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] || LogLevel.INFO
        : LogLevel.INFO;
      Logger.instance = new Logger(level);
    }
    return Logger.instance;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private colorize(text: string, color: string): string {
    if (!this.enableColors) return text;

    const colors: Record<string, string> = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
    };

    return `${colors[color]}${text}${colors.reset}`;
  }

  private log(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    error?: Error
  ): void {
    if (level < this.level) return;

    const levelName = LogLevel[level];
    const timestamp = this.formatTimestamp();

    // Store in history
    const entry: LogEntry = {
      timestamp,
      level: levelName,
      category,
      message,
      data,
      error,
    };

    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Format output
    let output = `[${timestamp}] `;

    // Level with color
    switch (level) {
      case LogLevel.DEBUG:
        output += this.colorize(`[${levelName}]`, 'cyan');
        break;
      case LogLevel.INFO:
        output += this.colorize(`[${levelName}]`, 'green');
        break;
      case LogLevel.WARN:
        output += this.colorize(`[${levelName}]`, 'yellow');
        break;
      case LogLevel.ERROR:
        output += this.colorize(`[${levelName}]`, 'red');
        break;
    }

    output += ` ${this.colorize(`[${category}]`, 'magenta')} ${message}`;

    // Write to stderr (stdout is used by MCP protocol)
    console.error(output);

    // Log data if present
    if (data !== undefined) {
      console.error(this.colorize('Data:', 'dim'), JSON.stringify(data, null, 2));
    }

    // Log error if present
    if (error) {
      console.error(this.colorize('Error:', 'red'), error.message);
      if (error.stack) {
        console.error(this.colorize('Stack:', 'dim'), error.stack);
      }
    }
  }

  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  /**
   * Get log history
   */
  getHistory(filter?: {
    level?: LogLevel;
    category?: string;
    since?: Date;
  }): LogEntry[] {
    let filtered = this.logHistory;

    if (filter) {
      if (filter.level !== undefined) {
        const levelName = LogLevel[filter.level];
        filtered = filtered.filter((entry) => entry.level === levelName);
      }

      if (filter.category) {
        filtered = filtered.filter((entry) => entry.category === filter.category);
      }

      if (filter.since) {
        const sinceTime = filter.since.toISOString();
        filtered = filtered.filter((entry) => entry.timestamp >= sinceTime);
      }
    }

    return filtered;
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
  } {
    const stats = {
      total: this.logHistory.length,
      byLevel: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
    };

    this.logHistory.forEach((entry) => {
      stats.byLevel[entry.level] = (stats.byLevel[entry.level] || 0) + 1;
      stats.byCategory[entry.category] = (stats.byCategory[entry.category] || 0) + 1;
    });

    return stats;
  }
}

/**
 * Create category-specific logger
 */
export function createLogger(category: string) {
  const logger = Logger.getInstance();

  return {
    debug: (message: string, data?: any) => logger.debug(category, message, data),
    info: (message: string, data?: any) => logger.info(category, message, data),
    warn: (message: string, data?: any) => logger.warn(category, message, data),
    error: (message: string, error?: Error, data?: any) =>
      logger.error(category, message, error, data),
  };
}

/**
 * Performance timing utility
 */
export class PerformanceTimer {
  private startTime: number;
  private checkpoints: Map<string, number> = new Map();
  private logger: ReturnType<typeof createLogger>;

  constructor(
    private category: string,
    private operation: string
  ) {
    this.logger = createLogger(category);
    this.startTime = Date.now();
    this.logger.debug(`${operation} started`);
  }

  checkpoint(name: string): void {
    const elapsed = Date.now() - this.startTime;
    this.checkpoints.set(name, elapsed);
    this.logger.debug(`${this.operation} - ${name}: ${elapsed}ms`);
  }

  end(data?: any): number {
    const elapsed = Date.now() - this.startTime;
    this.logger.info(`${this.operation} completed in ${elapsed}ms`, data);
    return elapsed;
  }

  endWithError(error: Error): number {
    const elapsed = Date.now() - this.startTime;
    this.logger.error(`${this.operation} failed after ${elapsed}ms`, error);
    return elapsed;
  }

  getCheckpoints(): Record<string, number> {
    return Object.fromEntries(this.checkpoints);
  }
}

