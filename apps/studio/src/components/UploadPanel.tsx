"use client";

import React from "react";

type Props = {
  bucket?: string;
  accept?: string;
  title?: string;
  onUploaded?: (info: { filename: string }) => void;
};

export default function UploadPanel({ bucket, accept, title, onUploaded }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-600">{title || "Upload file"}</label>
      <input
        type="file"
        accept={accept}
        className="block w-full text-sm"
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (!f) return;
          // Minimal stub: call onUploaded with filename only
          onUploaded?.({ filename: f.name });
        }}
      />
    </div>
  );
}
