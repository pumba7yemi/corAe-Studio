import { redirect } from 'next/navigation';

export default function BusinessPage() {
  // Redirect business route to ship-scoped Business page
  redirect('/ship/business');
}
