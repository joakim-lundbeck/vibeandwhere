import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { dataSource } from '@/lib/data-source';
import { IAttendee } from '@/lib/models/Attendee';
import { Logger } from '@/lib/services/logger';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const { id } = params;
    await connectDB();
    
    // Get the event first to get the invited attendees
    const event = await dataSource.getEventById(id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get all attendees
    const attendees = await dataSource.getAttendees();
    
    // Filter attendees based on the event's invitedAttendees
    const invitedAttendees = attendees.filter((attendee: IAttendee) => 
      event.invitedAttendees.includes(attendee._id.toString())
    );

    // Convert to plain objects
    const plainAttendees = invitedAttendees.map(attendee => {
      const plainAttendee = attendee.toObject();
      return {
        _id: plainAttendee._id.toString(),
        name: plainAttendee.name,
        email: plainAttendee.email
      };
    });

    return NextResponse.json(plainAttendees);
  } catch (error) {
    console.error('Error fetching attendees:', error);
    await Logger.error(
      'Error fetching attendees',
      'GET /api/events/[id]/attendees',
      error instanceof Error ? error : new Error(String(error)),
      { eventId: params.id }
    );
    return NextResponse.json(
      { error: 'Failed to fetch attendees' },
      { status: 500 }
    );
  }
} 