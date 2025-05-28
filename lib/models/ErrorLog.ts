import mongoose, { Schema, Document } from 'mongoose';

export interface IErrorLog extends Document {
  timestamp: Date;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  source: string;
  metadata?: Record<string, any>;
}

const ErrorLogSchema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  level: {
    type: String,
    enum: ['error', 'warn', 'info'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  stack: {
    type: String
  },
  source: {
    type: String,
    required: true
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Create index for efficient querying
ErrorLogSchema.index({ timestamp: -1 });
ErrorLogSchema.index({ level: 1 });
ErrorLogSchema.index({ source: 1 });

export default mongoose.models.ErrorLog || mongoose.model<IErrorLog>('ErrorLog', ErrorLogSchema); 