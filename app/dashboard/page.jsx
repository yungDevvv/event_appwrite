import { getLoggedInUser } from '@/lib/appwrite/server/appwrite';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await getLoggedInUser();
  const headersList = await headers();
  const referer = headersList.get('referer');

  if (user.role === "member") {
    return redirect(referer || "/login");
  }

  return redirect(`/dashboard/events`); 
}
