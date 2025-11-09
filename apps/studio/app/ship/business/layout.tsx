// apps/studio/app/ship/business/layout.tsx
export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <nav className="w-full border-b bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-6 text-[13px] text-gray-600">
          <a href="/ship/business/oms" className="hover:text-black">OMS</a>
          <a href="/ship/business/caia" className="hover:text-black">CAIA</a>
          <a href="/ship/business/comms" className="hover:text-black">corAe Comms™</a>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  );
}
