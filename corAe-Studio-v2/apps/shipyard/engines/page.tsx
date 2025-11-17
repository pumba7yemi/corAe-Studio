import { redirect } from "next/navigation";
const SHIPYARD_URL =
  process.env.NEXT_PUBLIC_SHIPYARD_URL || "http://localhost:3500";
export default function Page() {
  redirect(SHIPYARD_URL + "/engines");
}