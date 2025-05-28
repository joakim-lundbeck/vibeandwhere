import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { dataSource } from '@/lib/data-source';
import { Logger } from '@/lib/services/logger';

export async function GET() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Test data source by getting events
    const events = await dataSource.getEvents();

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      dataSource: dataSource['currentSource'],
      eventsCount: events.length,
      sampleEvent: events[0] || null
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    await Logger.error(
      'Database connection test failed',
      'GET /api/test-db',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json({ error: 'Database connection test failed' }, { status: 500 });
  }
} 