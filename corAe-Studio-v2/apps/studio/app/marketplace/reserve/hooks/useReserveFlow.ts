// apps/studio/app/marketplace/reserve/hooks/useReserveFlow.ts
"use client";

import { useState, useCallback } from "react";

interface ReserveFlow {
  stage: "BOOK" | "TRADE" | "DEAL" | "ORDER";
  loading: boolean;
  data: any;
  createReservation: (payload: any) => Promise<void>;
  elevateToTrade: (id: string) => Promise<void>;
  lockPrice: (id: string, pricelockRef: string) => Promise<void>;
  confirmDeal: (id: string, payload?: any) => Promise<void>;
  dispatchOrder: (dealId: string, payload?: any) => Promise<void>;
}

export function useReserveFlow(): ReserveFlow {
  const [stage, setStage] = useState<ReserveFlow["stage"]>("BOOK");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const createReservation = useCallback(async (payload: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/reserve/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.ok) {
        setData(json.reservation);
        setStage("BOOK");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const elevateToTrade = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/reserve/elevate", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.ok) {
        setData(json.reservation);
        setStage("TRADE");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const lockPrice = useCallback(async (id: string, pricelockRef: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/reserve/pricelock", {
        method: "POST",
        body: JSON.stringify({ id, pricelockRef }),
      });
      const json = await res.json();
      if (json.ok) {
        setData(json.reservation);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmDeal = useCallback(async (id: string, payload?: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/reserve/confirm", {
        method: "POST",
        body: JSON.stringify({ id, ...payload }),
      });
      const json = await res.json();
      if (json.ok) {
        setData(json.reservation);
        setStage("DEAL");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const dispatchOrder = useCallback(async (dealId: string, payload?: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/reserve/dispatch", {
        method: "POST",
        body: JSON.stringify({ dealId, ...payload }),
      });
      const json = await res.json();
      if (json.ok) {
        setData(json.order);
        setStage("ORDER");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stage,
    loading,
    data,
    createReservation,
    elevateToTrade,
    lockPrice,
    confirmDeal,
    dispatchOrder,
  };
}