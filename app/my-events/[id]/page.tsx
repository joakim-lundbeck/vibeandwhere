import connectDB from '@/lib/db/mongodb';
import { dataSource } from '@/lib/data-source';
import EventDetailsClient from './event-details-client';

interface PlainEvent {
  _id: string;
  name: string;
  location: string;
  organizerName: string;
  organizerEmail: string;
  invitedAttendees: string[];
  dates: {
    id: string;
    date: string;
    isAllDay: boolean;
    startTime?: string;
    endTime?: string;
  }[];
}

interface EventPageProps {
  params: {
    id: string;
  };
}

async function getEvent(id: string): Promise<PlainEvent | null> {
  await connectDB();
  const event = await dataSource.getEventById(id);
  
  if (!event) {
    return null;
  }

  // Convert Mongoose document to plain object
  const plainEvent = event.toObject();
  return {
    _id: plainEvent._id.toString(),
    name: plainEvent.name,
    location: plainEvent.location,
    organizerName: plainEvent.organizerName,
    organizerEmail: plainEvent.organizerEmail,
    invitedAttendees: plainEvent.invitedAttendees.map((id: any) => id.toString()),
    dates: plainEvent.dates.map((date: any) => ({
      id: date.id,
      date: date.date,
      isAllDay: date.isAllDay,
      startTime: date.startTime,
      endTime: date.endTime
    }))
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await getEvent(params.id);

  if (!event) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-teal">Event not found</h1>
        </div>
      </div>
    );
  }

  return <EventDetailsClient event={event} />;
} 