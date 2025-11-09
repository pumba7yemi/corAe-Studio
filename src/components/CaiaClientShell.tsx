"use client";

import { useState } from "react";
import { CaiaDock } from "@/components/CaiaDock";
import CaiaPanel from "@/components/CaiaPanel";

export default function CaiaClientShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {children}
      <CaiaDock onOpen={() => setOpen(true)} />
      {open && <CaiaPanel onClose={() => setOpen(false)} />}
    </>
  );
}