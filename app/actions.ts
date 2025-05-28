"use server"

import { Types } from 'mongoose';
import { Resend } from 'resend';
import connectDB from '@/lib/db/mongodb';
import { dataSource } from '@/lib/data-source';
import { IEvent } from '@/lib/models/Event';
import Event from '@/lib/models/Event';
import Response from '@/lib/models/Response';
import Attendee from '@/lib/models/Attendee';
import { Logger } from '@/lib/services/logger';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

interface DateSuggestion {
  date: Date;
  startTime: string;
  endTime: string;
  id: string;
}

interface Invitee {
  id: string;
  name: string;
  email: string;
}

interface EventData {
  organizerEmail: string;
  organizerName: string;
  eventName: string;
  eventLocation: string;
  eventDescription: string;
  eventWebsite: string;
  dateSuggestions: DateSuggestion[];
  invitees: Invitee[];
  eventId?: string;
  language: 'en' | 'sv';
}

type TranslationKey = 
  | 'youreInvitedTo'
  | 'hasInvitedYou'
  | 'eventDetails'
  | 'location'
  | 'proposedDatesTimes'
  | 'pleaseRespond'
  | 'invitationSentBy'
  | 'respondToInvitation'
  | 'eventCreated'
  | 'eventCreatedMessage'
  | 'importantNote'
  | 'accessEvent'
  | 'viewResponses'
  | 'eventName'
  | 'newResponse'
  | 'attendeeResponded'
  | 'availableDates'
  | 'viewAllResponses';

type Translations = {
  [key in 'en' | 'sv']: {
    [key in TranslationKey]: string;
  };
};

const translations: Translations = {
  en: {
    youreInvitedTo: "You're invited to:",
    hasInvitedYou: "has invited you to an event.",
    eventDetails: "Event Details:",
    location: "Location",
    proposedDatesTimes: "Proposed Dates & Times",
    pleaseRespond: "Please respond to this invitation to let the organizer know your availability.",
    invitationSentBy: "This invitation was sent by",
    respondToInvitation: "Respond to Invitation",
    eventCreated: "Your Event Has Been Created!",
    eventCreatedMessage: "Your event has been successfully created and invitations have been sent to all participants.",
    importantNote: "Important Note",
    accessEvent: "Access Your Event",
    viewResponses: "View Responses",
    eventName: "Event Name",
    newResponse: "New Response Received",
    attendeeResponded: "has responded to your event",
    availableDates: "Available Dates",
    viewAllResponses: "View All Responses"
  },
  sv: {
    youreInvitedTo: "Du är inbjuden till:",
    hasInvitedYou: "har bjudit in dig till ett evenemang.",
    eventDetails: "Evenemangsdetaljer:",
    location: "Plats",
    proposedDatesTimes: "Föreslagna datum och tider",
    pleaseRespond: "Vänligen svara på denna inbjudan för att låta arrangören veta om din tillgänglighet.",
    invitationSentBy: "Denna inbjudan skickades av",
    respondToInvitation: "Svara på Inbjudan",
    eventCreated: "Ditt Evenemang Har Skapats!",
    eventCreatedMessage: "Ditt evenemang har skapats och inbjudningar har skickats till alla deltagare.",
    importantNote: "Viktigt",
    accessEvent: "Tillgång till Ditt Evenemang",
    viewResponses: "Se Svar",
    eventName: "Evenemangsnamn",
    newResponse: "Nytt Svar Mottaget",
    attendeeResponded: "har svarat på ditt evenemang",
    availableDates: "Tillgängliga Datum",
    viewAllResponses: "Se Alla Svar"
  }
};

function t(key: TranslationKey, language: 'en' | 'sv' = 'en'): string {
  return translations[language][key];
}

function generateEmailContent(data: EventData, attendeeId: string): string {
  const language = data.language;
  const dateOptions = data.dateSuggestions
    .map((suggestion) => {
      const date = new Date(suggestion.date)
      const formattedDate = date.toLocaleDateString(language === 'sv' ? 'sv-SE' : 'en-US', {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      return `${formattedDate}, ${suggestion.startTime} - ${suggestion.endTime}`
    })
    .join("<br>")

  const responseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/event-response/${data.eventId}/${attendeeId}`

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #19747E;">${t("youreInvitedTo", language)} ${data.eventName}</h2>
      <p><strong>${data.organizerName}</strong> ${t("hasInvitedYou", language)}</p>
      
      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #19747E; background-color: #A9D6E5;">
        <h3 style="margin-top: 0;">${t("eventDetails", language)}</h3>
        <p><strong>${t("location", language)}:</strong> ${data.eventLocation}</p>
        ${data.eventWebsite ? `<p><strong>${language === 'sv' ? 'Webbplats' : 'Website'}:</strong> <a href="${data.eventWebsite}" style="color: #19747E;">${data.eventWebsite}</a></p>` : ""}
        ${data.eventDescription ? `<p><strong>${language === 'sv' ? 'Beskrivning' : 'Description'}:</strong><br>${data.eventDescription}</p>` : ""}
      </div>
      
      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #19747E; background-color: #A9D6E5;">
        <h3 style="margin-top: 0;">${t("proposedDatesTimes", language)}</h3>
        <p>${dateOptions}</p>
      </div>
      
      <p>${t("pleaseRespond", language)}</p>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${responseUrl}" style="display: inline-block; padding: 12px 24px; background-color: #19747E; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
          ${t("respondToInvitation", language)}
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          ${t("invitationSentBy", language)} ${data.organizerName} (${data.organizerEmail})
        </p>
      </div>
    </div>
  `
}

function generateOrganizerEmailContent(eventId: string, language: 'en' | 'sv', event: IEvent): string {
  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/my-events/${eventId}`;
  
  const formattedDates = event.dates.map(date => {
    const dateObj = new Date(date.date);
    const formattedDate = dateObj.toLocaleDateString(language === 'sv' ? 'sv-SE' : 'en-US', {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return `${formattedDate}, ${date.startTime} - ${date.endTime}`;
  }).join("<br>");

  const attendeeList = event.invitedAttendees.map((attendee: any) => 
    `<li>${attendee.name} (${attendee.email})</li>`
  ).join("");

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #19747E;">${t("eventCreated", language)}</h2>
      <p>${t("eventCreatedMessage", language)}</p>
      
      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #19747E; background-color: #A9D6E5;">
        <h3 style="margin-top: 0;">${t("eventDetails", language)}</h3>
        <p><strong>${t("eventName", language)}:</strong> ${event.name}</p>
        <p><strong>${t("location", language)}:</strong> ${event.location}</p>
        ${event.eventDescription ? `<p><strong>${language === 'sv' ? 'Beskrivning' : 'Description'}:</strong><br>${event.eventDescription}</p>` : ""}
        ${event.eventWebsite ? `<p><strong>${language === 'sv' ? 'Webbplats' : 'Website'}:</strong> <a href="${event.eventWebsite}" style="color: #19747E;">${event.eventWebsite}</a></p>` : ""}
      </div>

      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #19747E; background-color: #A9D6E5;">
        <h3 style="margin-top: 0;">${t("proposedDatesTimes", language)}</h3>
        <p>${formattedDates}</p>
      </div>

      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #19747E; background-color: #A9D6E5;">
        <h3 style="margin-top: 0;">${language === 'sv' ? 'Inbjudna Deltagare' : 'Invited Participants'}</h3>
        <ul style="list-style-type: none; padding-left: 0;">
          ${attendeeList}
        </ul>
      </div>
      
      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #FF6B6B; background-color: #FFE3E3;">
        <h3 style="margin-top: 0;">${t("importantNote", language)}</h3>
        <p>${language === 'sv' 
          ? 'Spara denna länk på ett säkert ställe. Detta är den enda vägen för att komma åt ditt evenemang och se svaren från deltagarna. Du kommer att behöva denna länk för att hantera ditt evenemang och se alla svar.'
          : 'Please save this link in a safe place. This is the only way to access your event and view responses from participants. You will need this link to manage your event and see all responses.'}</p>
      </div>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${eventUrl}" style="display: inline-block; padding: 12px 24px; background-color: #19747E; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
          ${t("accessEvent", language)}
        </a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          ${language === 'sv' 
            ? 'Om du har några frågor eller behöver hjälp, vänligen kontakta oss på support@whenandwhere.app'
            : 'If you have any questions or need assistance, please contact us at support@whenandwhere.app'}
        </p>
      </div>
    </div>
  `;
}

async function sendOrganizerConfirmationEmail(organizerEmail: string, eventId: string, language: 'en' | 'sv', event: IEvent) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'When & Where <noreply@whenandwhere.app>',
      to: organizerEmail,
      subject: t("eventCreated", language),
      html: generateOrganizerEmailContent(eventId, language, event),
    });

    if (error) {
      console.error('Error sending organizer confirmation email:', error);
      throw error;
    }

    console.log('Organizer confirmation email sent successfully:', emailData);
    await Logger.info(
      'Organizer confirmation email sent',
      'sendOrganizerConfirmationEmail',
      {
        eventId,
        organizerEmail,
        emailData
      }
    );
  } catch (error) {
    console.error('Failed to send organizer confirmation email:', error);
    throw error;
  }
}

export async function sendEventInvitations(data: EventData) {
  try {
    await connectDB();

    // Create event
    const event = await dataSource.createEvent({
      name: data.eventName,
      location: data.eventLocation,
      organizerName: data.organizerName,
      organizerEmail: data.organizerEmail,
      eventDescription: data.eventDescription,
      eventWebsite: data.eventWebsite,
      dates: data.dateSuggestions.map(suggestion => ({
        id: suggestion.id,
        date: suggestion.date.toISOString(),
        startTime: suggestion.startTime,
        endTime: suggestion.endTime
      })),
      invitedAttendees: [],
      language: data.language
    }) as IEvent & { _id: Types.ObjectId };

    await Logger.info(
      'New event created',
      'sendEventInvitations',
      {
        eventId: event._id.toString(),
        eventName: data.eventName,
        organizerEmail: data.organizerEmail,
        attendeeCount: data.invitees.length
      }
    );

    // Create attendees
    const attendeePromises = data.invitees.map(async (invitee) => {
      const attendee = await dataSource.createAttendee({
        name: invitee.name,
        email: invitee.email
      });
      return attendee as { _id: Types.ObjectId; email: string; name: string };
    });

    const attendees = await Promise.all(attendeePromises);

    // Update event with attendee IDs
    const updatedEvent = await dataSource.updateEvent(event._id.toString(), {
      invitedAttendees: attendees.map(attendee => attendee._id)
    }) as IEvent;

    // Fetch the event with populated attendee details
    const populatedEvent = await Event.findById(event._id)
      .populate('invitedAttendees')
      .exec() as IEvent;

    // Send confirmation email to organizer with complete event details
    await sendOrganizerConfirmationEmail(data.organizerEmail, event._id.toString(), data.language, populatedEvent);

    return {
      success: true,
      message: 'Event created successfully',
      eventId: event._id.toString()
    };
  } catch (error) {
    await Logger.error(
      'Failed to create event',
      'sendEventInvitations',
      error instanceof Error ? error : new Error(String(error)),
      {
        eventName: data.eventName,
        organizerEmail: data.organizerEmail,
        attendeeCount: data.invitees.length
      }
    );
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while creating the event'
    };
  }
}

async function sendResponseNotification(
  event: IEvent,
  attendee: { name: string; email: string },
  availableDates: string[]
) {
  try {
    // Map the selected date IDs to their corresponding dates from the event
    const formattedDates = availableDates.map(dateId => {
      const dateInfo = event.dates.find(d => d.id === dateId);
      if (!dateInfo) return '';
      
      const dateObj = new Date(dateInfo.date);
      return dateObj.toLocaleDateString(event.language === 'sv' ? 'sv-SE' : 'en-US', {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }) + (dateInfo.startTime && dateInfo.endTime ? `, ${dateInfo.startTime} - ${dateInfo.endTime}` : '');
    }).filter(date => date !== '');

    const { data: emailData, error } = await resend.emails.send({
      from: 'When & Where <noreply@whenandwhere.app>',
      to: event.organizerEmail,
      subject: `${t("newResponse", event.language)} - ${event.name}`,
      html: generateResponseNotificationContent(event, attendee, formattedDates, event.language),
    });

    if (error) {
      throw error;
    }

    await Logger.info(
      'Response notification sent successfully',
      'sendResponseNotification',
      { eventId: event._id, attendeeEmail: attendee.email, emailData }
    );
  } catch (error) {
    await Logger.error(
      'Failed to send response notification',
      'sendResponseNotification',
      error instanceof Error ? error : new Error(String(error)),
      { eventId: event._id, attendeeEmail: attendee.email }
    );
    throw error;
  }
}

function generateResponseNotificationContent(
  event: IEvent,
  attendee: { name: string; email: string },
  availableDates: string[],
  language: 'en' | 'sv'
): string {
  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/my-events/${event._id}`;
  
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #19747E;">${t("newResponse", language)}</h2>
      <p><strong>${attendee.name}</strong> ${t("attendeeResponded", language)} <strong>${event.name}</strong></p>
      
      <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #19747E; background-color: #A9D6E5;">
        <h3 style="margin-top: 0;">${t("availableDates", language)}</h3>
        <p>${availableDates.join("<br>")}</p>
      </div>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${eventUrl}" style="display: inline-block; padding: 12px 24px; background-color: #19747E; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
          ${t("viewAllResponses", language)}
        </a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          ${language === 'sv' 
            ? 'Detta är ett automatiskt meddelande. Vänligen svara inte på detta mail.'
            : 'This is an automated message. Please do not reply to this email.'}
        </p>
      </div>
    </div>
  `;
}

export async function createOrUpdateResponse(data: {
  eventId: string;
  attendeeId: string;
  availableDates: string[];
}) {
  const { eventId, attendeeId, availableDates } = data;

  try {
    await connectDB();

    // Find existing response
    let response = await Response.findOne({
      eventId: new Types.ObjectId(eventId),
      attendeeId: new Types.ObjectId(attendeeId)
    });

    if (response) {
      // Update existing response
      response.availableDates = availableDates;
      await response.save();
    } else {
      // Create new response
      response = await Response.create({
        eventId: new Types.ObjectId(eventId),
        attendeeId: new Types.ObjectId(attendeeId),
        availableDates
      });
    }

    // Get event and attendee details for notification
    const event = await Event.findById(eventId).exec() as IEvent;
    const attendee = await Attendee.findById(attendeeId).exec();

    if (!event || !attendee) {
      throw new Error('Event or attendee not found');
    }

    // Send notification to organizer
    await sendResponseNotification(event, attendee, availableDates);

    // Convert Mongoose document to plain object before returning
    return {
      _id: response._id.toString(),
      eventId: response.eventId.toString(),
      attendeeId: response.attendeeId.toString(),
      availableDates: response.availableDates
    };
  } catch (error) {
    await Logger.error(
      'Failed to create or update response',
      'createOrUpdateResponse',
      error instanceof Error ? error : new Error(String(error)),
      { eventId, attendeeId, availableDates }
    );
    throw error;
  }
}
