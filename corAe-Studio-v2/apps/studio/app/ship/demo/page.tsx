import AutoPilot from "@/components/demo/AutoPilot";

export default function DemoHubPage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">(Demo) corAe Demo Hub</h1>
      <p className="text-sm text-gray-600">Safe sandbox with mock data. Use Auto-Pilot to tour modules.</p>
      <AutoPilot />
      <ul className="list-disc pl-6 text-sm">
        <li>Home: Faith, Tasks, Pulse (demo)</li>
        <li>Work: 3³ Diary, Have-You, CIMS (demo)</li>
        <li>Business: OBARI, POS, Vendors (demo)</li>
      </ul>
    </main>
  );
}
