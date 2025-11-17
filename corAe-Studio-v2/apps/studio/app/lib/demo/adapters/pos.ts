import { seedCompanyA, Product, Order } from "../seed/companyA";
import { demoRand, demoPick } from "../mode";

// Demo POS adapter — read-only, deterministic. Uses seedCompanyA() to generate data.

export function getTopProducts(limit = 5) {
  const seed = seedCompanyA("companyA:pos");
  const products = seed.products.slice().sort((a, b) => b.stock - a.stock);
  return products.slice(0, limit).map((p) => ({ id: p.id, name: p.name, sku: p.sku, stock: p.stock, price: p.price }));
}

export function getDailySales(dayIndex = 0) {
  // dayIndex 0 = most recent day in seed orders
  const seed = seedCompanyA("companyA:pos");
  const orders = seed.orders.slice().reverse();
  const idx = Math.max(0, Math.min(orders.length - 1, dayIndex));
  const dayOrder = orders[idx];
  if (!dayOrder) return { total: 0, orders: [] as Order[] };
  return { total: dayOrder.total, orders: [dayOrder] };
}

export function getTillSummary() {
  const seed = seedCompanyA("companyA:pos");
  const tills = Array.from({ length: 3 }).map((_, i) => {
    const sales = Math.round((demoRand(`till:${i}`) * 1000 + 100) * 100) / 100;
    const tx = 5 + Math.floor(demoRand(`till:${i}:tx`) * 20);
    return { id: `till-${i + 1}`, sales, tx };
  });
  const total = Math.round(tills.reduce((s, t) => s + t.sales, 0) * 100) / 100;
  return { tills, total };
}

export default { getTopProducts, getDailySales, getTillSummary };
