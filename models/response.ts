import mongoose from 'mongoose'

const responseSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  attendeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendee',
    required: true
  },
  availableDates: [{
    type: Date,
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const Response = mongoose.models.Response || mongoose.model('Response', responseSchema) 