import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Event } from '@/models/event'
import { Attendee } from '@/models/attendee'

export async function GET() {
  try {
    await connectToDatabase()

    // Get all events to find organizers
    const events = await Event.find().lean()
    
    // Get all attendees
    const attendees = await Attendee.find().lean()

    // Create a map of organizers with their event counts
    const organizers = events.reduce((acc: any[], event) => {
      const existingOrganizer = acc.find(o => o.email === event.organizerEmail)
      if (existingOrganizer) {
        existingOrganizer.eventsOrganized++
      } else {
        acc.push({
          _id: event.organizerEmail, // Using email as ID since we don't have a separate users collection
          name: event.organizerName,
          email: event.organizerEmail,
          type: 'organizer',
          eventsOrganized: 1
        })
      }
      return acc
    }, [])

    // Create a map of attendees with their event counts
    const attendeeMap = attendees.reduce((acc: any[], attendee) => {
      const existingAttendee = acc.find(a => a.email === attendee.email)
      if (existingAttendee) {
        existingAttendee.eventsAttended++
      } else {
        acc.push({
          _id: attendee._id,
          name: attendee.name,
          email: attendee.email,
          type: 'attendee',
          eventsAttended: 1
        })
      }
      return acc
    }, [])

    // Combine organizers and attendees
    const users = [...organizers, ...attendeeMap]

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
} 