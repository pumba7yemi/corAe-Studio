export type ReserveTimelineEntry = { stage: string; at: string | Date | null };

export type ReservationDTO = {
  id: string;
  title?: string;
  description?: string | null;
  flowMode?: string;
  btdoStage?: string | null;
  status?: string;
  vendorRef?: string | null;
  customerRef?: string | null;
  pricelockRef?: string | null;
  quantity?: number;
  commission?: number | null;
  marginBasis?: string | null;
  windowStart?: string | Date | null;
  windowEnd?: string | Date | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};
