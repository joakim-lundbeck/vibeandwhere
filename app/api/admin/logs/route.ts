import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import { ErrorLog } from '@/models/error-log'
import { Logger } from '@/lib/services/logger'

export async function GET() {
  try {
    await connectDB()

    const logs = await ErrorLog.find()
      .sort({ timestamp: -1 })
      .limit(1000) // Limit to last 1000 logs to prevent overwhelming the client
      .lean()

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    await connectDB()

    // Delete all logs
    await ErrorLog.deleteMany({})

    await Logger.info(
      'All logs cleared by admin',
      'DELETE /api/admin/logs',
      {}
    )

    return NextResponse.json({ message: 'All logs cleared successfully' })
  } catch (error) {
    await Logger.error(
      'Failed to clear logs',
      'DELETE /api/admin/logs',
      error instanceof Error ? error : new Error(String(error)),
      {}
    )
    return NextResponse.json(
      { error: 'Failed to clear logs' },
      { status: 500 }
    )
  }
} 