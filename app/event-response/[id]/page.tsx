'use client';

import { useEffect, useState, use } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

interface PlainEvent {
  _id: string;
  name: string;
  location: string;
  invitedAttendees: string[];
}

interface PlainAttendee {
  _id: string;
  name: string;
  email: string;
}

interface EventResponsePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EventResponsePage({ params }: EventResponsePageProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [event, setEvent] = useState<PlainEvent | null>(null);
  const [attendees, setAttendees] = useState<PlainAttendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch event
        const eventResponse = await fetch(`/api/events/${resolvedParams.id}`);
        if (!eventResponse.ok) {
          throw new Error('Failed to fetch event');
        }
        const eventData = await eventResponse.json();
        setEvent(eventData);

        // Fetch attendees
        const attendeesResponse = await fetch(`/api/events/${resolvedParams.id}/attendees`);
        if (!attendeesResponse.ok) {
          throw new Error('Failed to fetch attendees');
        }
        const attendeesData = await attendeesResponse.json();
        setAttendees(attendeesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="gradient-bg min-h-screen pb-12">
        <div className="container mx-auto pt-32 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-none rounded-2xl card-shadow bg-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal mx-auto mb-4"></div>
                  <p className="text-teal/80">{t("loading")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gradient-bg min-h-screen pb-12">
        <div className="container mx-auto pt-32 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-none rounded-2xl card-shadow bg-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-medium text-teal mb-4">{t("error")}</h2>
                  <p className="text-teal/80 mb-6">{error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="gradient-bg min-h-screen pb-12">
        <div className="container mx-auto pt-32 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-none rounded-2xl card-shadow bg-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-medium text-teal mb-4">{t("eventNotFound")}</h2>
                  <p className="text-teal/80 mb-6">{t("eventNotFoundDescription")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen pb-12">
      <div className="container mx-auto pt-32 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-none rounded-2xl card-shadow bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-medium text-teal tracking-tight">
                {event.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-teal/80">{t("selectYourName")}</p>
                <div className="space-y-2">
                  {attendees.map((attendee) => (
                    <Button
                      key={attendee._id}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-sky/10 border-sky/30"
                      onClick={() => router.push(`/event-response/${resolvedParams.id}/${attendee._id}`)}
                    >
                      <div>
                        <div className="font-medium text-teal">{attendee.name}</div>
                        <div className="text-sm text-teal/70">{attendee.email}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 