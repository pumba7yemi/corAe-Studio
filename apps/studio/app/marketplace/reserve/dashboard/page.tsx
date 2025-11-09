// apps/studio/app/marketplace/reserve/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { BookQueue } from "./components/BookQueue";
import { DealDesk } from "./components/DealDesk";
import { OrderBoard } from "./components/OrderBoard";
import { BtdoRail } from "./components/BtdoRail";

export default function ReserveDashboard() {
  const [activeTab, setActiveTab] = useState<"BOOK" | "DEAL" | "ORDER" | "BTDO">("BOOK");

  useEffect(() => {
    document.title = "corAe Reserve™ Dashboard";
  }, []);

  return (
    <main className="min-h-screen w-full bg-neutral-50 text-gray-800 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">corAe Reserve™ Hub</h1>
        <nav className="space-x-3">
          <button
            onClick={() => setActiveTab("BOOK")}
            className={`px-3 py-1 rounded ${activeTab === "BOOK" ? "bg-black text-white" : "bg-gray-200"}`}
          >
            Book Queue
          </button>
          <button
            onClick={() => setActiveTab("DEAL")}
            className={`px-3 py-1 rounded ${activeTab === "DEAL" ? "bg-black text-white" : "bg-gray-200"}`}
          >
            Deal Desk
          </button>
          <button
            onClick={() => setActiveTab("ORDER")}
            className={`px-3 py-1 rounded ${activeTab === "ORDER" ? "bg-black text-white" : "bg-gray-200"}`}
          >
            Order Board
          </button>
          <button
            onClick={() => setActiveTab("BTDO")}
            className={`px-3 py-1 rounded ${activeTab === "BTDO" ? "bg-black text-white" : "bg-gray-200"}`}
          >
            BTDO Rail
          </button>
        </nav>
      </header>

      <section className="rounded-xl bg-white shadow-md p-6">
        {activeTab === "BOOK" && <BookQueue />}
        {activeTab === "DEAL" && <DealDesk />}
        {activeTab === "ORDER" && <OrderBoard />}
        {activeTab === "BTDO" && <BtdoRail />}
      </section>
    </main>
  );
}