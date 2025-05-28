import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyEventsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p>To view an event, please use the link provided in your event creation confirmation email.</p>
        </CardContent>
      </Card>
    </div>
  );
}
