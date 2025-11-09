// apps/studio/app/comms/obari/page.tsx
export default function ObariPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">OBARI</h1>
      <p className="text-sm text-gray-600">
        Offers, Pricelock (best deal locks), and Policies. Source-of-truth powering triage decisions and comms.
      </p>
      <div className="mt-4 grid sm:grid-cols-3 gap-3">
        <a href="#" className="border rounded-xl p-4 bg-white hover:shadow-sm">
          <div className="text-sm font-medium">Offers</div>
          <div className="text-xs text-gray-500">/data/obari/offers</div>
        </a>
        <a href="#" className="border rounded-xl p-4 bg-white hover:shadow-sm">
          <div className="text-sm font-medium">Pricelock</div>
          <div className="text-xs text-gray-500">/data/obari/locks</div>
        </a>
        <a href="#" className="border rounded-xl p-4 bg-white hover:shadow-sm">
          <div className="text-sm font-medium">Policies</div>
          <div className="text-xs text-gray-500">/data/obari/policies</div>
        </a>
      </div>
    </div>
  );
}
