import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { dataSource } from '@/lib/data-source';
import Event from "@/lib/models/Event";
import Response from "@/lib/models/Response";
import { Logger } from '@/lib/services/logger';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const { id } = params;
    await connectDB();
    const event = await dataSource.getEventById(id);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Convert Mongoose document to plain object
    const plainEvent = event.toObject();
    return NextResponse.json({
      _id: plainEvent._id.toString(),
      name: plainEvent.name,
      location: plainEvent.location,
      invitedAttendees: plainEvent.invitedAttendees.map((id: any) => id.toString()),
      dates: plainEvent.dates.map((date: any) => ({
        id: date.id,
        date: date.date,
        isAllDay: date.isAllDay,
        startTime: date.startTime,
        endTime: date.endTime
      }))
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    await Logger.error(
      'Error fetching event',
      'GET /api/events/[id]',
      error instanceof Error ? error : new Error(String(error)),
      { eventId: params.id }
    );
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const eventId = params.id;

  // Delete the event
  await Event.findByIdAndDelete(eventId);

  // Delete all responses for this event
  await Response.deleteMany({ eventId });

  // Optionally: Delete attendees only invited to this event (not included here)

  return NextResponse.json({ success: true });
} 