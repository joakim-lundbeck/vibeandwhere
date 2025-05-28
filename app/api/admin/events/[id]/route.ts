import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Event from '@/lib/models/Event';
import Attendee from '@/lib/models/Attendee';
import Response from '@/lib/models/Response';
import { Logger } from '@/lib/services/logger';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const eventId = params.id;

    // Find the event first to get related data
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Delete all responses for this event
    await Response.deleteMany({ eventId });

    // Delete all attendees that were invited to this event
    await Attendee.deleteMany({ _id: { $in: event.invitedAttendees } });

    // Finally, delete the event
    await Event.findByIdAndDelete(eventId);

    await Logger.info(
      'Event deleted by admin',
      'DELETE /api/admin/events/[id]',
      {
        eventId,
        eventName: event.name,
        organizerEmail: event.organizerEmail
      }
    );

    return NextResponse.json({ message: 'Event and related data deleted successfully' });
  } catch (error) {
    await Logger.error(
      'Failed to delete event',
      'DELETE /api/admin/events/[id]',
      error instanceof Error ? error : new Error(String(error)),
      { eventId: params.id }
    );
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
} 