export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation'
import { getLoggedInUser } from '@/lib/appwrite/server/appwrite';

export default async function Home() {
  const user = await getLoggedInUser();
  
  if (!user) {
    return redirect('/login');
  }

  if (user.role === "client") {
    return redirect("/dashboard/events");
  }

  if (user.active_event) {
    return redirect(`/event/${user.active_event}`);
  }

  return <div>Case that should be handled!</div>;
}
