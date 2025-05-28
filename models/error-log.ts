import mongoose from 'mongoose'

const errorLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warn', 'error'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

export const ErrorLog = mongoose.models.ErrorLog || mongoose.model('ErrorLog', errorLogSchema) 