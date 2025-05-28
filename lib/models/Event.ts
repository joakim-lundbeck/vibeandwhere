import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  location: string;
  organizerName: string;
  organizerEmail: string;
  eventDescription?: string;
  eventWebsite?: string;
  invitedAttendees: Types.ObjectId[];
  dates: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  }[];
  language: 'en' | 'sv';
}

const EventSchema = new Schema<IEvent>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  organizerName: { type: String, required: true },
  organizerEmail: { type: String, required: true },
  eventDescription: { type: String, default: '' },
  eventWebsite: { type: String, default: '' },
  invitedAttendees: [{ type: Schema.Types.ObjectId, ref: 'Attendee', required: true }],
  dates: [{
    id: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }],
  language: { type: String, enum: ['en', 'sv'], default: 'en' }
}, {
  timestamps: true,
});

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema); 