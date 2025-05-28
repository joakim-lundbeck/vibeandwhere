const isServer = typeof window === 'undefined';

export class Logger {
  private static async log(level: 'error' | 'warn' | 'info', message: string, source: string, error?: Error, metadata?: Record<string, any>) {
    // Always log to console
    console[level](`[${source}] ${message}`, error || '');

    // If on server, use server-side logging
    if (isServer) {
      try {
        // Dynamically import server logger only on server side
        const { ServerLogger } = await import('./server-logger');
        await ServerLogger[level](message, source, error, metadata);
      } catch (err) {
        console.error('Failed to use server logger:', err);
      }
    }
  }

  static async error(message: string, source: string, error?: Error, metadata?: Record<string, any>) {
    await this.log('error', message, source, error, metadata);
  }

  static async warn(message: string, source: string, error?: Error, metadata?: Record<string, any>) {
    await this.log('warn', message, source, error, metadata);
  }

  static async info(message: string, source: string, metadata?: Record<string, any>) {
    await this.log('info', message, source, undefined, metadata);
  }
} 