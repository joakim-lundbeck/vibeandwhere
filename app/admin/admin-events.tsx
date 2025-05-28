"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { sv, enUS } from "date-fns/locale"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

interface Event {
  _id: string
  name: string
  location: string
  organizerName: string
  organizerEmail: string
  dates: {
    id: string
    date: string
    startTime: string
    endTime: string
  }[]
  invitedAttendees: {
    _id: string
    name: string
    email: string
  }[]
  responses: {
    _id: string
    attendeeId: string
    availableDates: string[]
  }[]
}

export function AdminEvents() {
  const { language } = useLanguage()
  const locale = language === "sv" ? sv : enUS
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleDelete = async () => {
    if (!eventToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/events/${eventToDelete._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      toast({
        title: "Event deleted",
        description: "The event and all related data have been deleted successfully.",
      })

      // Refresh the events list
      await fetchEvents()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setEventToDelete(null)
    }
  }

  if (loading) return <div>Loading events...</div>
  if (error) return <div>Error: {error}</div>
  if (!events.length) return <div>No events found</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Attendees</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event._id}>
                  <TableCell className="font-medium">{event.name || 'Unnamed Event'}</TableCell>
                  <TableCell>
                    <div>{event.organizerName || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">{event.organizerEmail || 'No email'}</div>
                  </TableCell>
                  <TableCell>{event.location || 'No location'}</TableCell>
                  <TableCell>
                    {event.dates?.map((date) => (
                      <div key={`${event._id}-date-${date.id}`} className="text-sm">
                        {format(new Date(date.date), "MMM d", { locale })} • {date.startTime} - {date.endTime}
                      </div>
                    )) || 'No dates'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {event.invitedAttendees?.length || 0} invited
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.invitedAttendees?.map(attendee => (
                        <div key={`${event._id}-attendee-${attendee._id}`}>
                          {attendee.name || 'Unknown'}
                        </div>
                      )) || 'No attendees'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {event.responses?.length || 0} responses
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.responses?.map(response => {
                        const attendee = event.invitedAttendees?.find(a => a._id === response.attendeeId)
                        return (
                          <div key={`${event._id}-response-${response._id}`}>
                            {attendee?.name || 'Unknown Attendee'}
                          </div>
                        )
                      }) || 'No responses'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEventToDelete(event)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete event</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete:
              <ul className="list-disc list-inside mt-2">
                <li>The event "{eventToDelete?.name}"</li>
                <li>All attendee information</li>
                <li>All responses</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 