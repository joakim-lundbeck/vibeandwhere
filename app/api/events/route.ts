import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { dataSource } from '@/lib/data-source';
import { IEvent } from '@/lib/models/Event';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const events = await dataSource.getEvents();
    
    // Convert Mongoose documents to plain objects
    const plainEvents = events.map((event: IEvent) => {
      const plainEvent = event.toObject();
      return {
        _id: plainEvent._id.toString(),
        name: plainEvent.name,
        location: plainEvent.location,
        invitedAttendees: plainEvent.invitedAttendees,
        dates: plainEvent.dates
      };
    });

    return NextResponse.json(plainEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
} 