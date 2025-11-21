// OutboxDemo.tsx
// Standalone demo with mock messages and fake Automate responses.
// Lets you test OutboxList without Automate running yet.

import React, { useState } from "react";
import OutboxList from "./OutboxList";
import { OutboxMessage } from "./OutboxItem";
import { HandleRetryOptions } from "./handleRetry";

// Some initial dummy messages
const initialMessages: OutboxMessage[] = [
  {
    id: "1",
    workflowRunId: "wf-1001",
    title: "PO #1001 → Vendor A",
    status: "QUEUED",
    attempt: 0,
  },
  {
    id: "2",
    workflowRunId: "wf-1002",
    title: "PO #1002 → Vendor B",
    status: "FAILED",
    attempt: 2,
    reason: "Network timeout",
  },
  {
    id: "3",
    workflowRunId: "wf-1003",
    title: "PO #1003 → Vendor C",
    status: "CONFIRMED",
    attempt: 1,
  },
];

// Fake Automate base URL for testing
const mockOpts: HandleRetryOptions = {
  automateBaseUrl: "http://localhost:4000/automate",
  // swap fetchImpl with a mock so you can test without backend
  fetchImpl: async () =>
    new Response(
      JSON.stringify({ status: Math.random() > 0.5 ? "CONFIRMED" : "FAILED" }),
      { status: 200 }
    ),
};

export default function OutboxDemo() {
  const [messages, setMessages] = useState(initialMessages);

  return (
    <div className="max-w-lg mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4">📤 Outbox Demo</h2>
      <OutboxList
        messages={messages}
        handleRetryOpts={{
          ...mockOpts,
          // Wrap onRetry to update local state
          fetchImpl: async () => {
            // Random success/failure
            const ok = Math.random() > 0.3;
            return new Response(
              JSON.stringify({ status: ok ? "CONFIRMED" : "FAILED", reason: ok ? undefined : "Simulated fail" }),
              { status: ok ? 200 : 500 }
            );
          },
        }}
      />
    </div>
  );
}
