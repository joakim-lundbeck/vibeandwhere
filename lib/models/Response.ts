import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IResponse extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  attendeeId: Types.ObjectId;
  availableDates: string[];
}

const ResponseSchema = new Schema<IResponse>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  attendeeId: { type: Schema.Types.ObjectId, ref: 'Attendee', required: true },
  availableDates: [{ type: String, required: true }]
}, {
  timestamps: true
});

// Compound index to ensure one response per attendee per event
ResponseSchema.index({ eventId: 1, attendeeId: 1 }, { unique: true });

export default mongoose.models.Response || mongoose.model<IResponse>('Response', ResponseSchema); 