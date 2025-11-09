"use client";

import React from "react";

export default function MobileAppTabs() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 border-t border-slate-700 p-2 text-center text-xs text-slate-200">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4">
        <nav className="flex gap-3">
          <a href="/" className="px-3 py-1 rounded-md hover:bg-slate-700/50">Home</a>
          <a href="/cims" className="px-3 py-1 rounded-md hover:bg-slate-700/50">CIMS</a>
          <a href="/ship" className="px-3 py-1 rounded-md hover:bg-slate-700/50">Ship</a>
        </nav>
        <div className="text-[11px] text-slate-400">Mobile tabs</div>
      </div>
    </div>
  );
}
