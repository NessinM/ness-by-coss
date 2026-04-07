import { CodeBlock } from "@ness/ui/shared/code-block";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "open source is the foundation of all modern software",
  title: "ness.com video",
};

export default function Page() {
  const initialization = `import { ness } from '@ness';

ness.video.init({
  apiKey: process.env.ness_KEY,
  environment: 'production', // or 'sandbox'
});`;

  const rooms = `// Create a room
await ness.video.rooms.create({
  name: 'team-sync-0422',
  privacy: 'private',
  config: {
    enableChat: true,
    enableRecording: false,
    maxParticipants: 10,
  },
});

// List rooms
await ness.video.rooms.list();

// Retrieve room details
await ness.video.rooms.retrieve('team-sync-0422');

// Update room settings
await ness.video.rooms.update('team-sync-0422', {
  config: { enableRecording: true },
});

// Delete a room
await ness.video.rooms.delete('team-sync-0422');`;

  const tokens = `// Generate a join token
const token = await ness.video.tokens.create({
  roomName: 'team-sync-0422',
  userId: 'user_abc123',
  role: 'host',
  exp: Math.floor(Date.now() / 1000) + 60 * 60,
});`;

  const participants = `// List participants
await ness.video.participants.list('team-sync-0422');

// Kick a participant
await ness.video.participants.remove('team-sync-0422', 'user_abc123');

// Get participant history
await ness.video.participants.history({
  roomName: 'team-sync-0422',
  userId: 'user_abc123',
});`;

  const recordings = `// Start recording
await ness.video.recordings.start('team-sync-0422');

// Stop recording
await ness.video.recordings.stop('team-sync-0422');

// List past recordings
await ness.video.recordings.list();

// Retrieve a recording
await ness.video.recordings.retrieve('rec_abc123');

// Delete a recording
await ness.video.recordings.delete('rec_abc123');`;

  const webhooks = `// Webhook events
ness.video.webhooks.on('room.started', (event) => {
  console.log(\`Room started: \${event.data.roomName}\`);
});

ness.video.webhooks.on('participant.joined', (event) => {
  const { userId, roomName } = event.data;
  console.log(\`\${userId} joined \${roomName}\`);
});

// Other events:
// room.ended, participant.left, recording.started, recording.stopped`;

  const utilities = `// Validate webhook signature
const isValid = ness.video.utils.verifySignature({
  payload: req.body,
  signature: req.headers['ness-video-signature'],
  secret: 'whsec_video_123',
});`;

  const bonus = `// Generate a meeting URL
const meetingUrl = ness.video.utils.generateJoinUrl({
  roomName: 'team-sync-0422',
  token,
});`;

  return (
    <main className="container mb-16 w-full flex-1 lg:mb-20">
      <div className="mx-auto mt-12 max-w-2xl text-muted-foreground lg:mt-16 [&_a:not([data-slot='button'])]:text-foreground [&_strong]:text-foreground">
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Initialization
        </h2>
        <CodeBlock code={initialization} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Rooms
        </h2>
        <CodeBlock code={rooms} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Tokens
        </h2>
        <CodeBlock code={tokens} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Participants
        </h2>
        <CodeBlock code={participants} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Recordings
        </h2>
        <CodeBlock code={recordings} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Webhooks
        </h2>
        <CodeBlock code={webhooks} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Utilities
        </h2>
        <CodeBlock code={utilities} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Bonus - Meeting URL Generator
        </h2>
        <CodeBlock code={bonus} copyButton={false} language="tsx" />
      </div>
    </main>
  );
}
