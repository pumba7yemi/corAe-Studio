"use client";
import React from "react";

type Props = {
  onDone?: () => void;
};

export default function CaiaOnboarding({ onDone }: Props) {
  return (
    <div className="p-6 rounded-2xl border">
      <h2 className="text-xl font-semibold">Welcome to corAe</h2>
      <p className="mt-2">
        This is your quick intro. You can replace this with the real onboarding
        steps later.
      </p>
      <button
        className="mt-4 px-4 py-2 rounded-xl border"
        onClick={onDone}
        aria-label="Continue"
      >
        Continue
      </button>
    </div>
  );
}