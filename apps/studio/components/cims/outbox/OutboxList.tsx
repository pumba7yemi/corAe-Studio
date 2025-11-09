// OutboxList.tsx
// A simple list that renders OutboxItem components
// and injects handleRetry into each one.

import React from "react";
import OutboxItem, { OutboxMessage } from "./OutboxItem";
import { handleRetry, HandleRetryOptions } from "./handleRetry";

type Props = {
  messages: OutboxMessage[]; // list of messages to show
  handleRetryOpts: HandleRetryOptions; // config for Automate bridge
};

export default function OutboxList({ messages, handleRetryOpts }: Props) {
  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <div className="text-sm opacity-70">No pending messages.</div>
      ) : (
        messages.map((msg) => (
          <OutboxItem
            key={msg.id}
            msg={msg}
            onRetry={(m) => handleRetry(m, handleRetryOpts)}
          />
        ))
      )}
    </div>
  );
}
