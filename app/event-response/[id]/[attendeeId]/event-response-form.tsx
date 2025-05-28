"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { sv, enUS } from "date-fns/locale"
import { motion } from "framer-motion"
import { createOrUpdateResponse } from "@/app/actions"
import { Logger } from "@/lib/services/logger"

interface EventResponseFormProps {
  eventId: string
  attendeeId: string
}

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

export default function EventResponseForm({ eventId, attendeeId }: EventResponseFormProps) {
  const { t, language } = useLanguage()
  const locale = language === "sv" ? sv : enUS
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [event, setEvent] = useState<PlainEvent | null>(null)
  const [attendee, setAttendee] = useState<PlainAttendee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch event
        const eventResponse = await fetch(`/api/events/${eventId}`)
        if (!eventResponse.ok) {
          throw new Error('Failed to fetch event')
        }
        const eventData = await eventResponse.json()
        setEvent(eventData)

        // Fetch attendee
        const attendeeResponse = await fetch(`/api/attendees/${attendeeId}`)
        if (!attendeeResponse.ok) {
          throw new Error('Failed to fetch attendee')
        }
        const attendeeData = await attendeeResponse.json()
        setAttendee(attendeeData)

        // Fetch existing response
        const responseResponse = await fetch(`/api/events/${eventId}/responses`)
        if (responseResponse.ok) {
          const responses = await responseResponse.json()
          const existingResponse = responses.find((r: PlainResponse) => r.attendeeId === attendeeId)
          if (existingResponse) {
            setSelectedDates(existingResponse.availableDates)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [eventId, attendeeId])

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
    )
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
    )
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
    )
  }

  if (!attendee) {
    return (
      <div className="gradient-bg min-h-screen pb-12">
        <div className="container mx-auto pt-32 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-none rounded-2xl card-shadow bg-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-medium text-teal mb-4">{t("attendeeNotFound")}</h2>
                  <p className="text-teal/80 mb-6">{t("attendeeNotFoundDescription")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Check if attendee is invited to this event
  if (!event.invitedAttendees.includes(attendeeId)) {
    return (
      <div className="gradient-bg min-h-screen pb-12">
        <div className="container mx-auto pt-32 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-none rounded-2xl card-shadow bg-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-medium text-teal mb-4">{t("notInvited")}</h2>
                  <p className="text-teal/80 mb-6">{t("notInvitedDescription")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const handleDateToggle = (dateId: string) => {
    setSelectedDates(prev => 
      prev.includes(dateId)
        ? prev.filter(id => id !== dateId)
        : [...prev, dateId]
    )
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      const response = await createOrUpdateResponse({
        eventId,
        attendeeId,
        availableDates: selectedDates,
      })

      console.log('Response submitted successfully:', response)
      await Logger.info(
        'Response submitted successfully',
        'handleSubmit',
        {
          eventId,
          attendeeId,
          response
        }
      )
      setIsSubmitted(true)
    } catch (err) {
      console.error('Error submitting response:', err)
      await Logger.error(
        'Error submitting response',
        'handleSubmit',
        err instanceof Error ? err : new Error(String(err)),
        {
          eventId,
          attendeeId,
          selectedDates
        }
      )
      setError(err instanceof Error ? err.message : 'Failed to submit response')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="gradient-bg min-h-screen pb-12">
        <div className="container mx-auto pt-32 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-none rounded-2xl card-shadow bg-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-medium text-teal mb-4">{t("responseSubmitted")}</h2>
                  <p className="text-teal/80 mb-6">{t("responseSubmittedDescription")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="gradient-bg min-h-screen pb-12">
      <div className="container mx-auto pt-32 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-none rounded-2xl card-shadow bg-white">
            <CardHeader className="pb-2">
              <div className="mb-4 text-center">
                <span className="block text-lg text-teal font-medium">
                  {t("welcomeRespond").replace("{name}", attendee.name)}
                </span>
              </div>
              <CardTitle className="text-2xl font-medium text-teal tracking-tight flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                {event.name}
              </CardTitle>
              <CardDescription className="text-base text-teal/80 font-light">{event.location}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-teal mb-4">{t("selectAvailableDates")}</h3>
                  <div className="space-y-3">
                    {event.dates.map((date) => (
                      <motion.div
                        key={date.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-sky/10 hover:bg-sky/20 transition-colors"
                      >
                        <Checkbox
                          id={date.id}
                          checked={selectedDates.includes(date.id)}
                          onCheckedChange={() => handleDateToggle(date.id)}
                          className="h-5 w-5 rounded-sm border-teal data-[state=checked]:bg-teal data-[state=checked]:text-white"
                        />
                        <label
                          htmlFor={date.id}
                          className="flex-1 text-teal cursor-pointer"
                        >
                          <div className="font-medium">
                            {format(new Date(date.date), "EEEE, MMMM d", { locale })}
                          </div>
                          <div className="text-sm text-teal/70">
                            {date.startTime && date.endTime ? `${date.startTime} - ${date.endTime}` : ''}
                          </div>
                        </label>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || selectedDates.length === 0}
                    className="w-full bg-teal hover:bg-teal/90 text-white"
                  >
                    {isSubmitting ? t("submitting") : t("submitResponse")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 