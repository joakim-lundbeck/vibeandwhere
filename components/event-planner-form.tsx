"use client"

import type React from "react"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2, Sparkles, Clock, Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sendEventInvitations } from "@/app/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useLanguage } from "@/contexts/language-context"
import { sv, enUS } from "date-fns/locale"
import Link from "next/link"
import { Logger } from "@/lib/services/logger"

interface DateSuggestion {
  date: Date
  startTime: string
  endTime: string
  id: string
}

interface Invitee {
  id: string
  name: string
  email: string
}

interface EventDetails {
  name: string
  location: string
  description: string
  website: string
}

// Generate time options in 30-minute increments
const generateTimeOptions = () => {
  const options = []
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const h = hour.toString().padStart(2, "0")
      const m = minute.toString().padStart(2, "0")
      const time = `${h}:${m}`
      options.push({ value: time, label: time })
    }
  }
  return options
}

const timeOptions = generateTimeOptions()

export default function EventPlannerForm() {
  const { t, language } = useLanguage()
  const locale = language === "sv" ? sv : enUS

  const [organizerEmail, setOrganizerEmail] = useState("")
  const [organizerName, setOrganizerName] = useState("")
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    name: "",
    location: "",
    description: "",
    website: "",
  })
  const [dateSuggestions, setDateSuggestions] = useState<DateSuggestion[]>([])
  const [invitees, setInvitees] = useState<Invitee[]>([])
  const [newInviteeName, setNewInviteeName] = useState("")
  const [newInviteeEmail, setNewInviteeEmail] = useState("")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [agreementOpen, setAgreementOpen] = useState(false)

  const handleEventDetailsChange = (field: keyof EventDetails, value: string) => {
    setEventDetails((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addDateSuggestion = () => {
    if (selectedDate) {
      const newSuggestion: DateSuggestion = {
        date: selectedDate,
        startTime: startTime,
        endTime: endTime,
        id: Date.now().toString(),
      }

      // Check if date already exists with same time
      const exists = dateSuggestions.some(
        (suggestion) =>
          suggestion.date.toDateString() === selectedDate.toDateString() &&
          suggestion.startTime === startTime && 
          suggestion.endTime === endTime
      )

      if (!exists) {
        setDateSuggestions([...dateSuggestions, newSuggestion])
      }

      setCalendarOpen(false)
      setSelectedDate(undefined)
    }
  }

  const removeDateSuggestion = (id: string) => {
    setDateSuggestions(dateSuggestions.filter((suggestion) => suggestion.id !== id))
  }

  const addInvitee = () => {
    if (newInviteeName.trim()) {
      const newInvitee: Invitee = {
        id: Date.now().toString(),
        name: newInviteeName.trim(),
        email: newInviteeEmail.trim(),
      }
      setInvitees([...invitees, newInvitee])
      setNewInviteeName("")
      setNewInviteeEmail("")
    }
  }

  const removeInvitee = (id: string) => {
    setInvitees(invitees.filter((invitee) => invitee.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const eventData = {
        organizerEmail,
        organizerName,
        eventName: eventDetails.name,
        eventLocation: eventDetails.location,
        eventDescription: eventDetails.description,
        eventWebsite: eventDetails.website,
        dateSuggestions,
        invitees,
        language
      }

      const result = await sendEventInvitations(eventData)
      setSubmitResult(result)

      if (result.success && result.eventId) {
        // Redirect to the my-events page with the event ID
        window.location.href = `/my-events/${result.eventId}`
      }
    } catch (error) {
      console.error("Error sending invitations:", error)
      await Logger.error(
        'Error sending invitations',
        'handleSubmit',
        error instanceof Error ? error : new Error(String(error)),
        {
          eventName: eventDetails.name,
          organizerEmail: organizerEmail,
          attendeeCount: invitees.length
        }
      )
      setSubmitResult({
        success: false,
        message: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimeDisplay = (time: string) => time

  const validateForm = () => {
    return (
      organizerEmail.trim() !== "" &&
      organizerName.trim() !== "" &&
      eventDetails.name.trim() !== "" &&
      eventDetails.location.trim() !== "" &&
      dateSuggestions.length > 0 &&
      invitees.length > 0
    )
  }

  const openEmailPreview = () => {
    setPreviewOpen(true)
  }

  const generateEmailPreview = () => {
    const dateOptions = dateSuggestions.map((suggestion) => {
      const date = new Date(suggestion.date)
      const formattedDate = format(date, "EEEE, MMMM d, yyyy", { locale })
      return `${formattedDate}, ${suggestion.startTime} - ${suggestion.endTime}`
    })

    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="border-b pb-2">
          <div className="text-sm text-muted-foreground">{t("from")}</div>
          <div>
            {organizerName} &lt;{organizerEmail}&gt;
          </div>
        </div>

        <div className="border-b pb-2">
          <div className="text-sm text-muted-foreground">{t("to")}</div>
          <div className="max-h-20 overflow-y-auto">
            {invitees.map((invitee) => (
              <div key={invitee.id}>
                {invitee.name} &lt;{invitee.email}&gt;
              </div>
            ))}
          </div>
        </div>

        <div className="border-b pb-2">
          <div className="text-sm text-muted-foreground">{t("subject")}</div>
          <div>
            {t("youreInvitedTo").replace(":", "")} {eventDetails.name}
          </div>
        </div>

        <div className="pt-2">
          <div className="text-sm text-muted-foreground mb-2">{t("message")}</div>
          <div className="p-4 border rounded-md bg-card">
            <h2 className="text-xl font-medium text-teal mb-4">
              {t("youreInvitedTo")} {eventDetails.name}
            </h2>
            <p className="mb-4">
              <strong>{organizerName}</strong> {t("hasInvitedYou")}
            </p>

            <div className="my-4 p-3 border-l-4 border-teal bg-sky/10 rounded-r-md">
              <h3 className="font-medium mb-2">{t("eventDetails")}:</h3>
              <ul className="space-y-2">
                <li>
                  <strong>{t("location")}:</strong> {eventDetails.location}
                </li>
                {eventDetails.website && (
                  <li>
                    <strong>{t("website")}:</strong> {eventDetails.website}
                  </li>
                )}
              </ul>

              {eventDetails.description && (
                <div className="mt-2">
                  <strong>{t("description")}:</strong>
                  <p className="mt-1">{eventDetails.description}</p>
                </div>
              )}
            </div>

            <div className="my-4 p-3 border-l-4 border-teal bg-sky/10 rounded-r-md">
              <h3 className="font-medium mb-2">{t("proposedDatesTimes")}</h3>
              <ul className="space-y-1 list-disc list-inside">
                {dateOptions.map((option, index) => (
                  <li key={index}>{option}</li>
                ))}
              </ul>
            </div>

            <p>{t("pleaseRespond")}</p>

            <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
              {t("invitationSentBy")} {organizerName} ({organizerEmail})
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      id="event-planner-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <form onSubmit={handleSubmit}>
        <Card className="border-none rounded-2xl card-shadow bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-medium text-teal tracking-tight">{t("planYourEvent")}</CardTitle>
            <CardDescription className="text-base text-teal/80 font-light">{t("fillDetails")}</CardDescription>
          </CardHeader>

          {submitResult && (
            <div className="px-6">
              <Alert variant={submitResult.success ? "default" : "destructive"} className="mb-6 rounded-xl">
                <div className="flex items-center gap-2">
                  {submitResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{submitResult.success ? t("success") : t("error")}</AlertTitle>
                </div>
                <AlertDescription>{submitResult.message}</AlertDescription>
              </Alert>
            </div>
          )}

          <CardContent className="space-y-8">
            {/* Organizer Information */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-medium flex items-center gap-2 text-teal tracking-tight">
                <span className="bg-sky/20 p-1.5 rounded-md">
                  <Sparkles className="h-4 w-4 text-teal" />
                </span>
                {t("organizerInfo")}
              </h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="organizerEmail" className="text-sm flex items-center text-teal/80">
                    {t("emailAddress")} <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="organizerEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={organizerEmail}
                    onChange={(e) => setOrganizerEmail(e.target.value)}
                    required
                    className="rounded-xl border-sky/30 transition-all duration-200 focus:ring-1 focus:ring-teal/20 bg-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="organizerName" className="text-sm flex items-center text-teal/80">
                    {t("yourName")} <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="organizerName"
                    placeholder="John Doe"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    required
                    className="rounded-xl border-sky/30 transition-all duration-200 focus:ring-1 focus:ring-teal/20 bg-white"
                  />
                </div>
              </div>
            </motion.div>

            {/* Event Details */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-medium flex items-center gap-2 text-teal tracking-tight">
                <span className="bg-sky/20 p-1.5 rounded-md">
                  <CalendarIcon className="h-4 w-4 text-teal" />
                </span>
                {t("eventDetails")}
              </h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="eventName" className="text-sm flex items-center text-teal/80">
                    {t("eventName")} <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="eventName"
                    placeholder="Team Meeting"
                    value={eventDetails.name}
                    onChange={(e) => handleEventDetailsChange("name", e.target.value)}
                    required
                    className="rounded-xl border-sky/30 transition-all duration-200 focus:ring-1 focus:ring-teal/20 bg-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="eventLocation" className="text-sm flex items-center text-teal/80">
                    {t("location")} <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="eventLocation"
                    placeholder="Physical address or virtual meeting link"
                    value={eventDetails.location}
                    onChange={(e) => handleEventDetailsChange("location", e.target.value)}
                    required
                    className="rounded-xl border-sky/30 transition-all duration-200 focus:ring-1 focus:ring-teal/20 bg-white"
                  />
                  <p className="text-xs text-teal/70">{t("virtualEventTip")}</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="eventDescription" className="text-sm flex items-center text-teal/80">
                    {t("eventDetails")} <span className="text-muted-foreground text-xs ml-1">({t("optional")})</span>
                  </Label>
                  <Textarea
                    id="eventDescription"
                    placeholder="Provide details about the event..."
                    value={eventDetails.description}
                    onChange={(e) => handleEventDetailsChange("description", e.target.value)}
                    className="min-h-[100px] rounded-xl border-sky/30 transition-all duration-200 focus:ring-1 focus:ring-teal/20 bg-white"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="eventWebsite" className="text-sm flex items-center text-teal/80">
                    {t("website")} <span className="text-muted-foreground text-xs ml-1">({t("optional")})</span>
                  </Label>
                  <Input
                    id="eventWebsite"
                    type="url"
                    placeholder="https://example.com"
                    value={eventDetails.website}
                    onChange={(e) => handleEventDetailsChange("website", e.target.value)}
                    className="rounded-xl border-sky/30 transition-all duration-200 focus:ring-1 focus:ring-teal/20 bg-white"
                  />
                </div>

                {/* Date Suggestions */}
                <div className="grid gap-2 pt-2">
                  <Label className="text-sm flex items-center text-teal/80">
                    {t("dateTimeSuggestions")} <span className="text-destructive ml-1">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {dateSuggestions.map((suggestion) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1 bg-sky/20 text-teal px-3 py-1.5 rounded-full"
                      >
                        <span>
                          {format(suggestion.date, "MMM d", { locale })} •{" "}
                          {suggestion.startTime} - {suggestion.endTime}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full hover:bg-sky/30"
                          onClick={() => removeDateSuggestion(suggestion.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Remove date</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal rounded-xl border-sky/30 transition-all duration-200 bg-white",
                          !dateSuggestions.length && "text-teal/60",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateSuggestions.length ? t("addAnotherDate") : t("selectDateTime")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 shadow-lg rounded-xl border-none bg-white">
                      <div className="space-y-4">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className="rounded-lg"
                          locale={locale}
                        />

                        <div className="grid gap-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label htmlFor="startTime" className="text-sm text-teal/80">
                                {t("startTime")}
                              </Label>
                              <Select value={startTime} onValueChange={setStartTime}>
                                <SelectTrigger id="startTime" className="rounded-xl border-sky/30 bg-white">
                                  <SelectValue placeholder={t("startTime")} />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="endTime" className="text-sm text-teal/80">
                                {t("endTime")}
                              </Label>
                              <Select value={endTime} onValueChange={setEndTime}>
                                <SelectTrigger id="endTime" className="rounded-xl border-sky/30 bg-white">
                                  <SelectValue placeholder={t("endTime")} />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={addDateSuggestion}
                            disabled={selectedDate === null}
                            className="w-full rounded-xl bg-teal hover:bg-teal/90 text-white"
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            {t("addDateTime")}
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </motion.div>

            {/* Invitees */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-medium flex items-center gap-2 text-teal tracking-tight">
                <span className="bg-sky/20 p-1.5 rounded-md">
                  <Plus className="h-4 w-4 text-teal" />
                </span>
                {t("invitees")} <span className="text-destructive ml-1">*</span>
              </h3>

              {/* Add new invitee */}
              <div className="grid grid-cols-[1fr,1fr,auto] gap-2">
                <Input
                  placeholder={t("name")}
                  value={newInviteeName}
                  onChange={(e) => setNewInviteeName(e.target.value)}
                  className="rounded-xl border-sky/30 transition-all duration-200 focus:ring-1 focus:ring-teal/20 bg-white"
                />
                <Input
                  type="email"
                  placeholder={`${t("email")} (${t("optional")})`}
                  value={newInviteeEmail}
                  onChange={(e) => setNewInviteeEmail(e.target.value)}
                  className="rounded-xl border-sky/30 transition-all duration-200 focus:ring-1 focus:ring-teal/20 bg-white"
                />
                <Button
                  type="button"
                  onClick={addInvitee}
                  disabled={!newInviteeName.trim()}
                  className="rounded-xl transition-all duration-200 bg-teal hover:bg-teal/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("add")}
                </Button>
              </div>

              {/* Invitees list */}
              {invitees.length > 0 ? (
                <div className="border border-sky/30 rounded-xl overflow-hidden card-shadow bg-white">
                  <div className="grid grid-cols-[1fr,1fr,auto] p-3 bg-sky/10 text-sm text-teal/80">
                    <div>{t("name")}</div>
                    <div>{t("email")}</div>
                    <div className="w-10"></div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {invitees.map((invitee, index) => (
                      <motion.div
                        key={invitee.id}
                        className="grid grid-cols-[1fr,1fr,auto] p-3 border-t border-sky/20 items-center hover:bg-sky/5 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <div>{invitee.name}</div>
                        <div className="text-sm text-teal/70">{invitee.email}</div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeInvitee(invitee.id)}>
                          <Trash2 className="h-4 w-4 text-teal/70" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-teal/60 bg-sky/5 rounded-xl border border-dashed border-sky/30">
                  {t("noInviteesYet")}
                </div>
              )}
            </motion.div>
          </CardContent>

          <div className="px-6 pb-2">
            <p className="text-sm text-teal/70">
              <span className="text-destructive">*</span> {t("requiredFields")}
            </p>
          </div>

          <CardFooter className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-4">
            

            {/* User Agreement Checkbox */}
            <div className="flex items-center mt-2 mb-2 w-full">
              <Checkbox
                id="user-agreement"
                checked={agreed}
                onCheckedChange={checked => setAgreed(checked === true)}
                className="mr-3 border-2 border-teal shadow focus:ring-2 focus:ring-teal/40 w-6 h-6 rounded transition-all duration-150"
                required
              />
              <Label htmlFor="user-agreement" className="text-base font-semibold text-teal/90">
                {t("iAgreeTo")}{" "}
                <span
                  className="underline text-blue-600 cursor-pointer"
                  onClick={() => setAgreementOpen(true)}
                >
                  {t("userAgreementAndPrivacy")}
                </span>
              </Label>
            </div>

            <Button
              type="submit"
              className="flex-1 sm:flex-none sm:ml-auto rounded-full transition-all duration-300 bg-teal hover:bg-teal/90 text-white"
              disabled={isSubmitting || !validateForm() || !agreed}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("sending")}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {t("sendInvitations")}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-none card-shadow bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-medium text-teal tracking-tight">{t("emailPreview")}</DialogTitle>
            <DialogDescription className="text-teal/70 font-light">{t("emailPreviewDesc")}</DialogDescription>
          </DialogHeader>
          {generateEmailPreview()}
        </DialogContent>
      </Dialog>

      {/* User Agreement Modal */}
      <Dialog open={agreementOpen} onOpenChange={setAgreementOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-none card-shadow bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">{t("userAgreementTitle")}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-4 text-sm">
            <p>
              {t("userAgreementIntro")}
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li>
                <strong>{t("dataCollection")}:</strong> {t("dataCollectionText")}
              </li>
              <li>
                <strong>{t("purpose")}:</strong> {t("purposeText")}
              </li>
              <li>
                <strong>{t("dataSharing")}:</strong> {t("dataSharingText")}
              </li>
              <li>
                <strong>{t("userRights")}:</strong> {t("userRightsText")}
              </li>
              <li>
                <strong>{t("security")}:</strong> {t("securityText")}
              </li>
              <li>
                <strong>{t("contact")}:</strong> {t("contactText")} <a href="mailto:support@whenandwhere.com" className="underline text-blue-600">support@whenandwhere.com</a>.
              </li>
            </ol>
            <p>
              {t("agreementConclusion")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
