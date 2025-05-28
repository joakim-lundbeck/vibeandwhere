import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendee extends Document {
  name: string;
  email: string;
}

const AttendeeSchema = new Schema<IAttendee>({
  name: { type: String, required: true },
  email: { type: String }
}, {
  timestamps: true
});

export default mongoose.models.Attendee || mongoose.model<IAttendee>('Attendee', AttendeeSchema); 