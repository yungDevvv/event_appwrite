import EventsTable from "@/components/page-components/events-table";
import { Error } from "@/components/ui/error";
import { getLoggedInUser } from "@/lib/appwrite/server/appwrite";

export default async function Page() {
   const user = await getLoggedInUser();
   ;

   if (user.role === "member") {
      return redirect("/login");
   }

   // const eventsWithCountsWithReports = await Promise.all(events.map(async (event) => {
   //    const { count: membersCount } = await supabase
   //       .from('event_member')
   //       .select('*', { count: 'exact' })
   //       .eq('event_id', event.id);

   //    const { data } = await supabase
   //       .from('event_posts')
   //       .select('id')
   //       .eq('event_id', event.id)
   //       .eq('report_status', "waiting")
   //       .eq('is_reported', true)
       
   //    if (data.length !== 0) {
   //       return { ...event, memberCount: membersCount || 0, reportsCount: data.length || 0, reportedPosts: [...data] };
   //    }

   //    return { ...event, memberCount: membersCount || 0 };
   // }));

   return (
      // <EventsTable data={eventsWithCountsWithReports} user={user} />
      <EventsTable user={user} />
   );
}


