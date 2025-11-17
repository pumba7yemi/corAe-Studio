// apps/studio/app/manifesto/sector/retail.supermarket/what-is/page.tsx
export default function WhatIsSupermarketOS() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">What is the Supermarket OS</h1>

      <p className="opacity-80">
        The Supermarket OS is an intelligent retail management system that
        transforms how supermarkets operate — integrating inventory, purchasing,
        sales, vendor relations, and finance under one unified logic.
      </p>

      <p className="opacity-80">
        It follows the 28-day vendor cycle framework, complete with price-lock
        policies, expiry tracking, and automated reorder points. Every process
        is transparent, measured, and adaptable — giving owners total visibility
        across departments and teams.
      </p>

      <ul className="list-disc pl-5 opacity-80">
        <li>Live sales and POS sync across all counters</li>
        <li>Expiry and GRV tracking with weekly purchase analysis</li>
        <li>Vendor management and Pricelock Chain™ compliance</li>
        <li>Automated order logic based on stock movement</li>
      </ul>

      <p className="opacity-80">
        Built for both small shops and full-scale supermarkets, it adapts to
        each business size — helping teams spend less time managing stock and
        more time serving customers.
      </p>

      <div className="mt-6 text-sm opacity-70">
        <span>⚡ Powered by corAe OS² — Precision in Every Aisle.</span>
      </div>
    </main>
  );
}
