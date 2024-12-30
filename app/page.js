import { redirect } from 'next/navigation'
import { Error } from '@/components/ui/error';
import { getLoggedInUser } from '@/lib/appwrite/server/appwrite';


export default async function Home() {
  const user = await getLoggedInUser();


  if (user.role === "client") {
    return redirect("/dashboard/events");
  }

  if (user.active_event) {
    return redirect(`/event/${user.active_event}`)

  } else {
    return <div>Case that should be handled!</div>
  }
}

