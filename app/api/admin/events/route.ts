import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Event from '@/lib/models/Event'
import Attendee from '@/lib/models/Attendee'
import Response from '@/lib/models/Response'
import { IEvent } from '@/lib/models/Event'

export async function GET() {
  try {
    await connectDB()

    const events = await Event.find()
      .sort({ createdAt: -1 })
      .lean()

    // For each event, get the attendee and response details
    const eventsWithDetails = await Promise.all(
      events.map(async (event: any) => {
        // Get all attendees for this event
        const attendees = await Attendee.find({
          _id: { $in: event.invitedAttendees }
        }).lean()

        // Get all responses for this event
        const responses = await Response.find({
          eventId: event._id
        }).lean()
        
        return {
          ...event,
          invitedAttendees: attendees,
          responses: responses
        }
      })
    )

    return NextResponse.json(eventsWithDetails)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
} 