import ErrorLog from '@/lib/models/ErrorLog';
import connectDB from '@/lib/db/mongodb';

export class ServerLogger {
  private static async log(level: 'error' | 'warn' | 'info', message: string, source: string, error?: Error, metadata?: Record<string, any>) {
    try {
      await connectDB();
      
      const logEntry = new ErrorLog({
        level,
        message,
        source,
        stack: error?.stack,
        metadata: {
          ...metadata,
          errorName: error?.name,
          errorMessage: error?.message
        }
      });

      await logEntry.save();
    } catch (err) {
      console.error('Failed to save log to database:', err);
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