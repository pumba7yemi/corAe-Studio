import type { Order } from "../types.js";

export function listOrders(): Order[] {
  return [];
}

export function getOrder(id: string): Order | null {
  return null;
}

export function createOrder(o: Order): Order {
  return o;
}