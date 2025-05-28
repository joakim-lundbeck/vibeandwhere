import { IEvent } from './models/Event';
import { IAttendee } from './models/Attendee';
import { IResponse } from './models/Response';
import Event from './models/Event';
import Attendee from './models/Attendee';
import Response from './models/Response';
import { Types } from 'mongoose';
import connectDB from './db/mongodb';

export type DataSource = 'mock' | 'mongodb';

interface CreateEventParams {
  name: string;
  location: string;
  organizerName: string;
  organizerEmail: string;
  eventDescription?: string;
  eventWebsite?: string;
  dates: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  }[];
  invitedAttendees: Types.ObjectId[];
  language: 'en' | 'sv';
}

export class DataSourceManager {
  private static instance: DataSourceManager;
  private currentSource: DataSource;

  private constructor() {
    // Initialize with environment variable, default to 'mongodb' if not set
    this.currentSource = (process.env.DATA_SOURCE as DataSource) || 'mongodb';
    if (this.currentSource !== 'mock' && this.currentSource !== 'mongodb') {
      console.warn(`Invalid DATA_SOURCE value: ${this.currentSource}. Defaulting to 'mongodb'`);
      this.currentSource = 'mongodb';
    }
  }

  static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager();
    }
    return DataSourceManager.instance;
  }

  setDataSource(source: DataSource) {
    this.currentSource = source;
  }

  getCurrentSource(): DataSource {
    return this.currentSource;
  }

  async getEvents(): Promise<IEvent[]> {
    return Event.find().exec();
  }

  async getEventById(id: string): Promise<IEvent | null> {
    return Event.findById(id).exec();
  }

  async createEvent(eventData: CreateEventParams): Promise<IEvent> {
    const event = new Event(eventData);
    return await event.save();
  }

  async updateEvent(id: string, eventData: {
    invitedAttendees?: Types.ObjectId[];
  }): Promise<IEvent | null> {
    return Event.findByIdAndUpdate(id, eventData, { new: true }).exec();
  }

  async getAttendees(): Promise<IAttendee[]> {
    return Attendee.find().exec();
  }

  async getAttendeeById(id: string): Promise<IAttendee | null> {
    return Attendee.findById(id).exec();
  }

  async createAttendee(attendeeData: {
    name: string;
    email: string;
  }): Promise<IAttendee> {
    const attendee = new Attendee(attendeeData);
    return await attendee.save();
  }

  async getResponses(): Promise<IResponse[]> {
    return Response.find().exec();
  }

  async getResponsesByEventId(eventId: string): Promise<IResponse[]> {
    return Response.find({ eventId: new Types.ObjectId(eventId) }).exec();
  }

  async getResponseByEventAndAttendee(eventId: string, attendeeId: string): Promise<IResponse | null> {
    return Response.findOne({ eventId, attendeeId }).exec();
  }

  async createResponse(response: Omit<IResponse, '_id'>): Promise<IResponse> {
    const newResponse = new Response(response);
    return newResponse.save();
  }

  async updateResponse(id: string, response: Partial<IResponse>): Promise<IResponse | null> {
    return Response.findByIdAndUpdate(id, response, { new: true }).exec();
  }

  async createOrUpdateResponse(data: {
    eventId: string;
    attendeeId: string;
    availableDates: string[];
  }) {
    const { eventId, attendeeId, availableDates } = data;
    
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

    return response;
  }

  async createEventWithDB(data: {
    name: string;
    location: string;
    organizerName: string;
    organizerEmail: string;
    eventDescription?: string;
    eventWebsite?: string;
    dates: {
      id: string;
      date: string;
      startTime?: string;
      endTime?: string;
    }[];
    invitedAttendees: Types.ObjectId[];
    language: 'en' | 'sv';
  }) {
    await connectDB();
    return Event.create(data);
  }

  async getEventWithDB(id: string) {
    await connectDB();
    return Event.findById(id).populate('invitedAttendees');
  }

  async updateEventWithDB(id: string, data: Partial<typeof Event>) {
    await connectDB();
    return Event.findByIdAndUpdate(id, data, { new: true });
  }

  async createAttendeeWithDB(data: { name: string; email: string }) {
    await connectDB();
    return Attendee.create(data);
  }

  async getAttendeeWithDB(id: string) {
    await connectDB();
    return Attendee.findById(id);
  }

  async createResponseWithDB(data: {
    eventId: Types.ObjectId;
    attendeeId: Types.ObjectId;
    availableDates: string[];
  }) {
    await connectDB();
    return Response.create(data);
  }

  async getResponsesWithDB(eventId: string) {
    await connectDB();
    return Response.find({ eventId: new Types.ObjectId(eventId) })
      .populate('attendeeId');
  }
}

export const dataSource = DataSourceManager.getInstance(); 