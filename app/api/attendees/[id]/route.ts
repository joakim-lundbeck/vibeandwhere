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
    
    const attendee = await dataSource.getAttendeeById(id);
    if (!attendee) {
      return NextResponse.json(
        { error: 'Attendee not found' },
        { status: 404 }
      );
    }

    // Convert to plain object
    const plainAttendee = attendee.toObject();
    return NextResponse.json({
      _id: plainAttendee._id.toString(),
      name: plainAttendee.name,
      email: plainAttendee.email
    });
  } catch (error) {
    console.error('Error fetching attendee:', error);
    await Logger.error(
      'Error fetching attendee',
      'GET /api/attendees/[id]',
      error instanceof Error ? error : new Error(String(error)),
      { attendeeId: params.id }
    );
    return NextResponse.json(
      { error: 'Failed to fetch attendee' },
      { status: 500 }
    );
  }
} 