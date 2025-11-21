import { demoRand, demoPick } from "../mode";

// Monkey steps:
// 1. Save to: apps/studio/app/lib/demo/seed/companyA.ts
// 2. Import and call seedCompanyA() from demo pages/adapters when demo mode is active.
// 3. No DB writes — returns pure JS objects suitable for rendering in the Demo Hub.

export type Product = {
  id: string;
  sku: string;
  name: string;
  cost: number;
  price: number;
  gpPercent: number;
  stock: number;
};

export type Employee = { id: string; name: string; role: string };

export type OrderItem = { productId: string; qty: number; unitPrice: number; lineTotal: number };

export type Order = { id: string; ts: string; items: OrderItem[]; total: number };

export type CompanyASeed = { products: Product[]; employees: Employee[]; orders: Order[] };

const letters = "abcdefghijklmnopqrstuvwxyz".split("");

function priceFromIndex(i: number) {
  const base = 5 + i * 1.5;
  return Math.round(base * 100) / 100;
}

export function seedCompanyA(key = "companyA") : CompanyASeed {
  // Products: A..Z
  const products: Product[] = letters.map((ch, idx) => {
    const id = `prod-${ch}`;
    const sku = `A-${(idx+1).toString().padStart(3,'0')}`;
    const cost = Math.round((priceFromIndex(idx) * 0.6 + demoRand(`${key}:cost:${idx}`) * 2) * 100) / 100;
    const price = Math.round((cost * (1 + 0.35 + demoRand(`${key}:markup:${idx}`) * 0.2)) * 100) / 100;
    const gpPercent = Math.round(((price - cost) / price) * 100);
    const stock = Math.max(0, Math.floor(demoRand(`${key}:stock:${idx}`) * 200));
    return { id, sku, name: `Product ${ch.toUpperCase()}`, cost, price, gpPercent, stock };
  });

  // Employees
  const roles = ["Owner","Ops","HR","Cashier","Buyer","GRV","Floor","Delivery","Marketing","Accountant"];
  const employees: Employee[] = roles.map((r, i) => ({ id: `emp-${i+1}`, name: `${r} ${String.fromCharCode(65 + (i % 26))}`, role: r }));

  // Orders: create a deterministic set (e.g., 14 orders)
  const orders: Order[] = Array.from({ length: 14 }).map((_, oi) => {
    const ts = new Date(Date.now() - (14 - oi) * 3600 * 1000 * 6).toISOString();
    const itemCount = 1 + Math.floor(demoRand(`${key}:order:${oi}:count`) * 4);
    const items: OrderItem[] = Array.from({ length: itemCount }).map((__, j) => {
      const p = demoPick(`${key}:order:${oi}:pick:${j}`, products);
      const qty = 1 + Math.floor(demoRand(`${key}:order:${oi}:qty:${j}`) * 5);
      const unitPrice = p.price;
      const lineTotal = Math.round(unitPrice * qty * 100) / 100;
      return { productId: p.id, qty, unitPrice, lineTotal };
    });
    const total = Math.round(items.reduce((s, it) => s + it.lineTotal, 0) * 100) / 100;
    return { id: `ord-${oi+1}`, ts, items, total };
  });

  return { products, employees, orders };
}

export default seedCompanyA;
