import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminEvents } from "./admin-events"
import { AdminUsers } from "./admin-users"
import { AdminLogs } from "./admin-logs"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="border-none rounded-2xl card-shadow bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-teal tracking-tight">Administrator Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="events">
              <AdminEvents />
            </TabsContent>
            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>
            <TabsContent value="logs">
              <AdminLogs />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 