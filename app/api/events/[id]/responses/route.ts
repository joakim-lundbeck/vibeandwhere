import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { dataSource } from '@/lib/data-source';
import { Logger } from '@/lib/services/logger';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const { id } = params;
    await connectDB();
    
    const responses = await dataSource.getResponsesByEventId(id);
    
    // Convert to plain objects
    const plainResponses = responses.map(response => {
      const plainResponse = response.toObject();
      return {
        _id: plainResponse._id.toString(),
        eventId: plainResponse.eventId.toString(),
        attendeeId: plainResponse.attendeeId.toString(),
        availableDates: plainResponse.availableDates
      };
    });

    return NextResponse.json(plainResponses);
  } catch (error) {
    console.error('Error fetching responses:', error);
    await Logger.error(
      'Error fetching responses',
      'GET /api/events/[id]/responses',
      error instanceof Error ? error : new Error(String(error)),
      { eventId: params.id }
    );
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { attendeeId, availableDates } = body;

    await connectDB();

    // Check if event exists
    const event = await dataSource.getEventById(id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if attendee exists and is invited
    const attendee = await dataSource.getAttendeeById(attendeeId);
    if (!attendee) {
      return NextResponse.json(
        { error: 'Attendee not found' },
        { status: 404 }
      );
    }

    if (!event.invitedAttendees.includes(attendeeId)) {
      return NextResponse.json(
        { error: 'Attendee is not invited to this event' },
        { status: 403 }
      );
    }

    // Create or update response
    const response = await dataSource.createOrUpdateResponse({
      eventId: id,
      attendeeId,
      availableDates
    });

    // Convert to plain object
    const plainResponse = response.toObject();
    return NextResponse.json({
      _id: plainResponse._id.toString(),
      eventId: plainResponse.eventId.toString(),
      attendeeId: plainResponse.attendeeId.toString(),
      availableDates: plainResponse.availableDates
    });
  } catch (error) {
    console.error('Error submitting response:', error);
    await Logger.error(
      'Error submitting response',
      'POST /api/events/[id]/responses',
      error instanceof Error ? error : new Error(String(error)),
      { eventId: params.id }
    );
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    );
  }
} 