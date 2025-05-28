import EventResponseForm from './event-response-form'

interface EventResponsePageProps {
  params: Promise<{
    id: string
    attendeeId: string
  }>
}

export default async function EventResponsePage({ params }: EventResponsePageProps) {
  const { id, attendeeId } = await params

  return <EventResponseForm eventId={id} attendeeId={attendeeId} />
} 