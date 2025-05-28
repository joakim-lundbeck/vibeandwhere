'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { format } from 'date-fns';
import { sv, enUS } from 'date-fns/locale';
import { ArrowLeft, Check, MapPin, Globe, Copy } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface PlainEvent {
  _id: string;
  name: string;
  location: string;
  invitedAttendees: string[];
  dates: {
    id: string;
    date: string;
    startTime?: string;
    endTime?: string;
  }[];
  eventWebsite?: string;
  eventDescription?: string;
  organizerName: string;
  organizerEmail: string;
}

interface PlainAttendee {
  _id: string;
  name: string;
  email: string;
}

interface PlainResponse {
  _id: string;
  eventId: string;
  attendeeId: string;
  availableDates: string[];
}

interface EventDetailsClientProps {
  event: PlainEvent;
}

export default function EventDetailsClient({ event }: EventDetailsClientProps) {
  const { t, language } = useLanguage();
  const locale = language === 'sv' ? sv : enUS;
  const [attendees, setAttendees] = useState<PlainAttendee[]>([]);
  const [responses, setResponses] = useState<PlainResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostPopularDateId, setMostPopularDateId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyResponseUrl = async () => {
    const url = `${window.location.origin}/event-response/${event._id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch attendees
        const attendeesResponse = await fetch(`/api/events/${event._id}/attendees`);
        if (!attendeesResponse.ok) {
          throw new Error('Failed to fetch attendees');
        }
        const attendeesData = await attendeesResponse.json();
        setAttendees(attendeesData);

        // Fetch responses
        const responsesResponse = await fetch(`/api/events/${event._id}/responses`);
        if (!responsesResponse.ok) {
          throw new Error('Failed to fetch responses');
        }
        const responsesData = await responsesResponse.json();
        setResponses(responsesData);

        // Calculate most popular date
        const dateCounts = new Map<string, number>();
        responsesData.forEach((response: PlainResponse) => {
          response.availableDates.forEach((dateId: string) => {
            dateCounts.set(dateId, (dateCounts.get(dateId) || 0) + 1);
          });
        });
        
        let maxCount = 0;
        let mostPopular = null;
        dateCounts.forEach((count, dateId) => {
          if (count > maxCount) {
            maxCount = count;
            mostPopular = dateId;
          }
        });
        
        setMostPopularDateId(mostPopular);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [event._id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen pb-12">
      <div className="container mx-auto pt-32 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Event Header */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-medium tracking-tight text-teal">{event.name}</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Location Card */}
                  <div className="bg-sky/10 rounded-xl p-3">
                    <div className="text-sm text-teal/60 mb-1">{t('location')}</div>
                    <div className="flex items-center text-teal">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Organizer Card */}
                  <div className="bg-sky/10 rounded-xl p-3">
                    <div className="text-sm text-teal/60 mb-1">{t('organizer')}</div>
                    <div className="font-medium text-teal truncate">{event.organizerName}</div>
                    <div className="text-sm text-teal/80 truncate">{event.organizerEmail}</div>
                  </div>

                  {/* Details Card */}
                  <div className="bg-sky/10 rounded-xl p-3">
                    <div className="text-sm text-teal/60 mb-1">{t('eventDetails')}</div>
                    <div className="text-teal/80 line-clamp-2">
                      {event.eventDescription || t('noDescription')}
                    </div>
                  </div>

                  {/* Website Card */}
                  <div className="bg-sky/10 rounded-xl p-3">
                    <div className="text-sm text-teal/60 mb-1">{t('website')}</div>
                    {event.eventWebsite ? (
                      <a 
                        href={event.eventWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-teal hover:text-teal/80 truncate"
                      >
                        <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{event.eventWebsite}</span>
                      </a>
                    ) : (
                      <div className="text-teal/60">{t('noWebsite')}</div>
                    )}
                  </div>
                </div>

                {/* Response Stats */}
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="bg-sky/10 rounded-xl p-3">
                    <div className="text-sm text-teal/60 mb-1">{t('invitedParticipants')}</div>
                    <div className="font-medium text-teal">{attendees.length}</div>
                  </div>

                  <div className="bg-sky/10 rounded-xl p-3">
                    <div className="text-sm text-teal/60 mb-1">{t('responses')}</div>
                    <div className="font-medium text-teal">{responses.length}</div>
                    <div className="text-sm text-teal/80">
                      {((responses.length / attendees.length) * 100).toFixed(0)}% {t('responseRate')}
                    </div>
                  </div>

                  <div className="bg-sky/10 rounded-xl p-3">
                    <div className="text-sm text-teal/60 mb-1">{t('proposedDates')}</div>
                    <div className="font-medium text-teal">{event.dates.length}</div>
                  </div>
                </div>

                {/* Copy Response URL Button */}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={copyResponseUrl}
                    className="flex items-center gap-2 px-8 py-4 bg-teal text-white rounded-xl hover:bg-teal/90 transition-colors shadow-md text-center max-w-2xl"
                  >
                    {copied ? (
                      <>
                        <Check className="h-5 w-5" />
                        <span>{t('copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5" />
                        <span className="text-base">{t('copyResponseUrl')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Responses Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] text-teal">{t('attendee')}</TableHead>
                  {event.dates.map((date) => (
                    <TableHead 
                      key={date.id} 
                      className={cn(
                        "text-center text-teal",
                        date.id === mostPopularDateId && "border-l border-r border-green-500 bg-green-50/30"
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <div className="font-medium">
                          {format(new Date(date.date), 'EEE', { locale })}
                        </div>
                        <div className="text-sm text-teal/70">
                          {format(new Date(date.date), 'MMM d', { locale })}
                        </div>
                        {date.startTime && date.endTime && (
                          <div className="text-xs text-teal/60">
                            {date.startTime} - {date.endTime}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((attendee) => {
                  const response = responses.find(r => r.attendeeId === attendee._id);
                  const availableDates = response?.availableDates || [];

                  return (
                    <TableRow key={attendee._id}>
                      <TableCell className="font-medium text-teal">
                        <div>{attendee.name}</div>
                        <div className="text-sm text-teal/70">{attendee.email}</div>
                      </TableCell>
                      {event.dates.map((date) => (
                        <TableCell 
                          key={date.id} 
                          className={cn(
                            "text-center",
                            date.id === mostPopularDateId && "border-l border-r border-green-500 bg-green-50/30"
                          )}
                        >
                          {availableDates.includes(date.id) ? (
                            <div className="flex justify-center">
                              <div className="w-6 h-6 rounded-full bg-teal/10 flex items-center justify-center">
                                <Check className="w-4 h-4 text-teal" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-teal/20 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
} 