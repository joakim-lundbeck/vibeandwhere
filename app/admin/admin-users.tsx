"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface User {
  _id: string
  name: string
  email: string
  type: 'organizer' | 'attendee'
  eventsOrganized?: number
  eventsAttended?: number
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users')
        if (!response.ok) throw new Error('Failed to fetch users')
        const data = await response.json()
        setUsers(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) return <div>Loading users...</div>
  if (error) return <div>Error: {error}</div>
  if (!users.length) return <div>No users found</div>

  const organizers = users.filter(user => user.type === 'organizer')
  const attendees = users.filter(user => user.type === 'attendee')

  return (
    <div className="space-y-4">
      <Tabs defaultValue="organizers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="organizers">Organizers ({organizers.length})</TabsTrigger>
          <TabsTrigger value="attendees">Attendees ({attendees.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="organizers">
          <Card>
            <CardContent className="p-0">
              {organizers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Events Organized</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">{user.name || 'Unknown'}</TableCell>
                        <TableCell>{user.email || 'No email'}</TableCell>
                        <TableCell>{user.eventsOrganized || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-4 text-center text-muted-foreground">No organizers found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attendees">
          <Card>
            <CardContent className="p-0">
              {attendees.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Events Attended</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendees.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">{user.name || 'Unknown'}</TableCell>
                        <TableCell>{user.email || 'No email'}</TableCell>
                        <TableCell>{user.eventsAttended || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-4 text-center text-muted-foreground">No attendees found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 