import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  website: {
    type: String
  },
  organizerName: {
    type: String,
    required: true
  },
  organizerEmail: {
    type: String,
    required: true
  },
  dateSuggestions: [{
    type: Date,
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema) 