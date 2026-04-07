import { CodeBlock } from "@ness/ui/shared/code-block";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "open source is the foundation of all modern software",
  title: "ness.com scheduling",
};

export default function Page() {
  const initialization = `import { ness } from '@ness';

ness.scheduling.init({
  apiKey: process.env.ness_KEY,
  environment: 'production', // or 'sandbox'
});`;

  const users = `// Create a user
await ness.scheduling.users.create({
  email: 'jane@example.com',
  name: 'Jane Doe',
});

// Retrieve a user
await ness.scheduling.users.retrieve('user_abc123');`;

  const schedules = `// Create a schedule
await ness.scheduling.schedules.create({
  userId: 'user_abc123',
  availability: [
    {
      day: 'Monday',
      start: '09:00',
      end: '17:00',
    },
    // ... other days
  ],
});

// Retrieve schedules
await ness.scheduling.schedules.list({ userId: 'user_abc123' });`;

  const eventTypes = `// Create an event type
await ness.scheduling.eventTypes.create({
  userId: 'user_abc123',
  name: 'Consultation',
  duration: 30,
  scheduleId: 'schedule_abc123',
});

// Retrieve event types
await ness.scheduling.eventTypes.list({ userId: 'user_abc123' });`;

  const bookings = `// Create a booking
await ness.scheduling.bookings.create({
  eventTypeId: 'eventType_abc123',
  attendee: {
    name: 'John Smith',
    email: 'john@example.com',
  },
  start: '2025-05-01T15:00:00Z',
});

// Retrieve bookings
await ness.scheduling.bookings.list({ userId: 'user_abc123' });`;

  const webhooks = `// Webhook events
ness.scheduling.webhooks.on('booking.created', (event) => {
  console.log('New booking:', event.data);
});

ness.scheduling.webhooks.on('booking.cancelled', (event) => {
  console.log('Booking cancelled:', event.data);
});`;

  const utilities = `// Validate webhook signature
const isValid = ness.scheduling.utils.verifySignature({
  payload: req.body,
  signature: req.headers['ness-scheduling-signature'],
  secret: 'whsec_scheduling_123',
});`;

  return (
    <main className="container mb-16 w-full flex-1 lg:mb-20">
      <div className="mx-auto mt-12 max-w-2xl text-muted-foreground lg:mt-16 [&_a:not([data-slot='button'])]:text-foreground [&_strong]:text-foreground">
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Initialization
        </h2>
        <CodeBlock code={initialization} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Users
        </h2>
        <CodeBlock code={users} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Schedules
        </h2>
        <CodeBlock code={schedules} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Event Types
        </h2>
        <CodeBlock code={eventTypes} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Bookings
        </h2>
        <CodeBlock code={bookings} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Webhooks
        </h2>
        <CodeBlock code={webhooks} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Utilities
        </h2>
        <CodeBlock code={utilities} copyButton={false} language="tsx" />
      </div>
    </main>
  );
}
