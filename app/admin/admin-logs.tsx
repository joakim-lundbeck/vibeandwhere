"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface Log {
  _id: string
  level: 'info' | 'warn' | 'error'
  message: string
  source: string
  metadata: Record<string, any>
  timestamp: string
}

export function AdminLogs() {
  const { language } = useLanguage()
  const locale = language === "sv" ? sv : enUS
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const { toast } = useToast()

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs')
      if (!response.ok) throw new Error('Failed to fetch logs')
      const data = await response.json()
      setLogs(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleClearLogs = async () => {
    setIsClearing(true)
    try {
      const response = await fetch('/api/admin/logs', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to clear logs')
      }

      toast({
        title: "Logs cleared",
        description: "All logs have been cleared successfully.",
      })

      // Refresh the logs list
      await fetchLogs()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to clear logs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
      setShowClearConfirmation(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    if (!log) return false
    const matchesSearch = (
      (log.message?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (log.source?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.metadata || {}).toLowerCase().includes(searchTerm.toLowerCase())
    )
    const matchesLevel = levelFilter === "all" || log.level === levelFilter
    return matchesSearch && matchesLevel
  })

  if (loading) return <div>Loading logs...</div>
  if (error) return <div>Error: {error}</div>
  if (!logs.length) return <div>No logs found</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="destructive"
          onClick={() => setShowClearConfirmation(true)}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear All Logs
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss", { locale })}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level || 'unknown'}
                      </span>
                    </TableCell>
                    <TableCell>{log.source || 'Unknown source'}</TableCell>
                    <TableCell>{log.message || 'No message'}</TableCell>
                    <TableCell>
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(log.metadata || {}, null, 2)}
                      </pre>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No logs match your search criteria</div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showClearConfirmation} onOpenChange={setShowClearConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to clear all logs?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all log entries from the system.
              <ul className="list-disc list-inside mt-2">
                <li>All error logs</li>
                <li>All warning logs</li>
                <li>All info logs</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearLogs}
              disabled={isClearing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isClearing ? 'Clearing...' : 'Clear All Logs'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 