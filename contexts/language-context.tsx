"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "sv"

type Translations = {
  [key in Language]: {
    [key: string]: string
  }
}

export const translations: Translations = {
  en: {
    backToEvents: "Back to Events",
    tagline: "When&Where",
    description: "Create events, invite guests, and manage RSVPs with ease.",
    signIn: "Sign In",
    letsChat: "Let's Chat",
    planYourEvent: "Plan Your Event",
    fillDetails: "Fill in the details to create your event and invite people.",
    organizerInfo: "Organizer Information",
    emailAddress: "E-mail Address",
    yourName: "Your Name",
    eventDetails: "Event Details",
    eventName: "Event Name",
    location: "Location",
    virtualEventTip: 'For virtual events, include the meeting link or indicate "Virtual"',
    optional: "optional",
    website: "Website",
    dateTimeSuggestions: "Date & Time Suggestions",
    addAnotherDate: "Add another date & time",
    selectDateTime: "Select date & time",
    allDayEvent: "All Day Event",
    startTime: "Start Time",
    endTime: "End Time",
    addDateTime: "Add Date & Time",
    invitees: "Invitees",
    name: "Name",
    email: "Email",
    add: "Add",
    noInviteesYet: "No invitees added yet",
    requiredFields: "Required fields",
    previewEmail: "Preview Email",
    sending: "Sending...",
    sendInvitations: "Send Invitations",
    emailPreview: "Email Preview",
    emailPreviewDesc: "This is how your invitation email will appear to recipients.",
    from: "From",
    to: "To",
    subject: "Subject",
    message: "Message",
    youreInvitedTo: "You're invited to:",
    hasInvitedYou: "has invited you to an event.",
    proposedDatesTimes: "Proposed Dates & Times:",
    pleaseRespond: "Please respond to this invitation to let the organizer know your availability.",
    invitationSentBy: "This invitation was sent by",
    allDay: "All Day",
    success: "Success",
    error: "Error",
    switchToSwedish: "Svenska",
    switchToEnglish: "English",
    languageEn: "English",
    languageSv: "Svenska",
    scrollToStart: "Scroll down to start planning",
    myEvents: "My Events",
    createNewEvent: "Create New Event",
    eventResponses: "Event Responses",
    attendees: "Attendees",
    availability: "Availability",
    actions: "Actions",
    sendReminder: "Send Reminder",
    reminderSent: "Reminder Sent",
    responded: "Responded",
    notResponded: "Not Responded",
    bestDate: "Best Date",
    secondBestDate: "Second Best Date",
    attendeeCount: "Attendee Count",
    canAttend: "Can Attend",
    cannotAttend: "Cannot Attend",
    pending: "Pending",
    backToHome: "Back to Home",
    responseRate: "Response Rate",
    selectAvailableDates: "Select the dates you can attend",
    submitResponse: "Submit Response",
    thankYouForResponding: "Thank You for Responding!",
    responseRecorded: "Your response has been recorded. The event organizer will be notified.",
    viewEventResponse: "View Event Response",
    eventNotFound: "Event Not Found",
    loading: "Loading...",
    submitting: "Submitting...",
    eventNotFoundDescription: "The event you're looking for could not be found.",
    attendeeNotFound: "Attendee Not Found",
    attendeeNotFoundDescription: "The attendee you're looking for could not be found.",
    notInvited: "Not Invited",
    notInvitedDescription: "You are not invited to this event.",
    responseSubmitted: "Response Submitted",
    responseSubmittedDescription: "Your response has been recorded. The event organizer will be notified.",
    welcomeRespond: "Welcome, {name}! Please respond to this event.",
    respondToInvitation: "Respond to Invitation",
    userAgreementTitle: "User Agreement & Privacy Policy",
    userAgreementIntro: "By using When & Where, you agree to the following:",
    dataCollection: "Data Collection",
    dataCollectionText: "We collect and store personal information such as your name, email address, and event details to facilitate event planning and invitations.",
    purpose: "Purpose",
    purposeText: "Your data is used solely for managing events, sending invitations, and tracking responses.",
    dataSharing: "Data Sharing",
    dataSharingText: "Your information may be shared with event organizers and other invitees for the purpose of event coordination. We do not sell your data to third parties.",
    userRights: "User Rights",
    userRightsText: "You may request access to, correction, or deletion of your personal data at any time by contacting us.",
    security: "Security",
    securityText: "We implement reasonable security measures to protect your data.",
    contact: "Contact",
    contactText: "For questions or requests regarding your data, contact us at",
    agreementConclusion: "By using this application and checking the agreement box, you acknowledge that you have read and agree to this User Agreement and Privacy Policy.",
    iAgreeTo: "I agree to the",
    userAgreementAndPrivacy: "User Agreement and Privacy Policy",
    noDescription: "No description provided",
    noWebsite: "No website provided",
    proposedDates: "Proposed Dates",
    invitedParticipants: "Invited Participants",
    responses: "Responses",
    selectYourName: "Please select your name from the list below",
    copyResponseUrl: "Ready to send out invitations? Click here to copy the invitation URL",
    copied: "URL Copied!",
  },
  sv: {
    backToEvents: "Tillbaka till Evenemang",
    tagline: "When&Where",
    description: "Skapa evenemang, bjud in gäster och hantera RSVP enkelt.",
    signIn: "Logga in",
    letsChat: "Kontakta oss",
    planYourEvent: "Planera ditt evenemang",
    fillDetails: "Fyll i detaljerna för att skapa ditt evenemang och bjuda in personer.",
    organizerInfo: "Arrangörsinformation",
    emailAddress: "E-postadress",
    yourName: "Ditt namn",
    eventDetails: "Evenemangsdetaljer",
    eventName: "Evenemangsnamn",
    location: "Plats",
    virtualEventTip: 'För virtuella evenemang, inkludera möteslänken eller ange "Virtuellt"',
    optional: "valfritt",
    website: "Webbplats",
    dateTimeSuggestions: "Förslag på datum och tid",
    addAnotherDate: "Lägg till ett annat datum och tid",
    selectDateTime: "Välj datum och tid",
    allDayEvent: "Heldagsevenemang",
    startTime: "Starttid",
    endTime: "Sluttid",
    addDateTime: "Lägg till datum och tid",
    invitees: "Inbjudna",
    name: "Namn",
    email: "E-post",
    add: "Lägg till",
    noInviteesYet: "Inga inbjudna än",
    requiredFields: "Obligatoriska fält",
    previewEmail: "Förhandsgranska e-post",
    sending: "Skickar...",
    sendInvitations: "Skicka inbjudningar",
    emailPreview: "E-postförhandsgranskning",
    emailPreviewDesc: "Så här kommer din inbjudan att visas för mottagarna.",
    from: "Från",
    to: "Till",
    subject: "Ämne",
    message: "Meddelande",
    youreInvitedTo: "Du är inbjuden till:",
    hasInvitedYou: "har bjudit in dig till ett evenemang.",
    proposedDatesTimes: "Föreslagna datum och tider:",
    pleaseRespond: "Vänligen svara på denna inbjudan för att låta arrangören veta om din tillgänglighet.",
    invitationSentBy: "Denna inbjudan skickades av",
    allDay: "Heldag",
    success: "Framgång",
    error: "Fel",
    switchToSwedish: "Svenska",
    switchToEnglish: "English",
    languageEn: "English",
    languageSv: "Svenska",
    scrollToStart: "Scrolla ner för att börja planera",
    myEvents: "Mina Evenemang",
    createNewEvent: "Skapa Nytt Evenemang",
    eventResponses: "Evenemangsvar",
    attendees: "Deltagare",
    availability: "Tillgänglighet",
    actions: "Åtgärder",
    sendReminder: "Skicka Påminnelse",
    reminderSent: "Påminnelse Skickad",
    responded: "Svarat",
    notResponded: "Inte Svarat",
    bestDate: "Bästa Datum",
    secondBestDate: "Näst Bästa Datum",
    attendeeCount: "Antal Deltagare",
    canAttend: "Kan Delta",
    cannotAttend: "Kan Inte Delta",
    pending: "Väntar",
    backToHome: "Tillbaka till Startsidan",
    responseRate: "Svarsfrekvens",
    selectAvailableDates: "Välj de datum du kan delta",
    submitResponse: "Skicka svar",
    thankYouForResponding: "Tack för ditt svar!",
    responseRecorded: "Ditt svar har registrerats. Arrangören kommer att meddelas.",
    viewEventResponse: "Visa Evenemangssvar",
    eventNotFound: "Evenemanget Hittades Inte",
    loading: "Laddar...",
    submitting: "Skickar...",
    eventNotFoundDescription: "Evenemanget du letar efter kunde inte hittas.",
    attendeeNotFound: "Deltagare Hittades Inte",
    attendeeNotFoundDescription: "Deltagaren du letar efter kunde inte hittas.",
    notInvited: "Inte Inbjuden",
    notInvitedDescription: "Du är inte inbjuden till detta evenemang.",
    responseSubmitted: "Svar Skickat",
    responseSubmittedDescription: "Ditt svar har registrerats. Arrangören kommer att meddelas.",
    welcomeRespond: "Välkommen, {name}! Vänligen svara på detta evenemang.",
    respondToInvitation: "Svara på Inbjudan",
    userAgreementTitle: "Användaravtal & Integritetspolicy",
    userAgreementIntro: "Genom att använda When & Where godkänner du följande:",
    dataCollection: "Datainsamling",
    dataCollectionText: "Vi samlar in och lagrar personlig information som ditt namn, e-postadress och evenemangsdetaljer för att underlätta evenemangsplanering och inbjudningar.",
    purpose: "Syfte",
    purposeText: "Dina uppgifter används endast för att hantera evenemang, skicka inbjudningar och spåra svar.",
    dataSharing: "Datadelning",
    dataSharingText: "Din information kan delas med evenemangsarrangörer och andra inbjudna för att koordinera evenemanget. Vi säljer inte dina uppgifter till tredje part.",
    userRights: "Användarrättigheter",
    userRightsText: "Du kan när som helst begära tillgång till, korrigering eller radering av dina personuppgifter genom att kontakta oss.",
    security: "Säkerhet",
    securityText: "Vi implementerar rimliga säkerhetsåtgärder för att skydda dina uppgifter.",
    contact: "Kontakt",
    contactText: "För frågor eller förfrågningar gällande dina uppgifter, kontakta oss på",
    agreementConclusion: "Genom att använda denna applikation och kryssa i avtalsrutan bekräftar du att du har läst och godkänner detta användaravtal och integritetspolicy.",
    iAgreeTo: "Jag godkänner",
    userAgreementAndPrivacy: "Användaravtal och Integritetspolicy",
    noDescription: "Ingen beskrivning tillgänglig",
    noWebsite: "Ingen webbplats tillgänglig",
    proposedDates: "Föreslagna Datum",
    invitedParticipants: "Inbjudna Deltagare",
    responses: "Svar",
    selectYourName: "Välj ditt namn från listan nedan",
    copyResponseUrl: "Redo att skicka inbjudningar? Klicka här för att kopiera inbjudningslänken",
    copied: "URL Kopierad!",
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  // Try to load language preference from localStorage on client side
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "sv")) {
      setLanguage(savedLanguage)
    } else {
      // Try to detect browser language
      const browserLanguage = navigator.language.split("-")[0]
      if (browserLanguage === "sv") {
        setLanguage("sv")
      }
    }
  }, [])

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
