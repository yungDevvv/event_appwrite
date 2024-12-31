import RegisterForEventForm from "@/components/forms/register-for-event-form";
import { getDocument, getLoggedInUser } from "@/lib/appwrite/server/appwrite";
import { redirect } from "next/navigation";

export const metadata = {
   title: "Events Suosittelu Mylly",
   description: "Pois Tieltä Oy",
   icons: {
      icon: "/favicon.svg",
   },
};

export default async function Page({ params }) {
   let user = null;
   try {
      user = await getLoggedInUser();
      if (user && user?.role === "member") {
         return redirect("/event/" + user.active_event);
      }
   } catch (error) {
   }

   const { eventId } = await params;

   const { data, error } = await getDocument('main_db', 'events', eventId);

   if (!data) {
      return (
         <div className="flex h-screen w-full items-center justify-center px-4 bg-orange-100">
            <h1 className="text-2xl text-red-500 text-center">Tapahtuma ei löytynyt</h1>
         </div>
      )
   }

   if (error) {
      return (
         <div className="flex h-screen w-full items-center justify-center px-4 bg-orange-100">
            <h1 className="text-2xl text-red-500 text-center">Internal Server Error 505</h1>
         </div>
      )
   }

   if (data) {
      return (
         <div className="flex h-screen w-full items-center justify-center px-4 bg-orange-100 relative">
            <RegisterForEventForm logo={data.users?.clientData?.logo ? data.users?.clientData?.logo : null} title={data.event_name} invintation_id={eventId} />
         </div>
      );
   }

}
