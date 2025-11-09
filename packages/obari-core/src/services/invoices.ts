import type { Invoice } from "../types.js";

export function listInvoices(): Invoice[] {
  return [];
}

export function getInvoice(id: string): Invoice | null {
  return null;
}

export function createInvoice(i: Invoice): Invoice {
  return i;
}