import { Error } from "@/components/ui/error";
import { Toaster } from "@/components/ui/toaster";
import { EventProvider } from "@/context/EventContext";
import { getDocument, getLoggedInUser } from "@/lib/appwrite/server/appwrite";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

async function EventLayout({ children, params }) {
   const { invintation_id } = await params;
   console.log(invintation_id,)
   const messages = await getMessages();

   const user = await getLoggedInUser();

   const { data: event, error: eventError } = await getDocument('main_db', 'events', invintation_id)

   if (eventError) {
      console.log(eventError);
      return <Error text="500 Internal Server Error" />
   }

   if (!event) {
      return <Error text="Tapahtuma ei löydy!" />
   }

   const eventData = event;
   const userData = user;

   const isMember = userData && eventData.event_member.find((member) => member.users.$id === userData.$id)
   
   return (
      <NextIntlClientProvider messages={messages}>
         <EventProvider value={{ eventData, userData }}>
            <main className="w-full h-full min-h-screen bg-black">
               {/* {isMember
                  ? 
                  : "Et ole tapahtuman osallistuja"
               } */}
               {isMember && children}
               {!isMember && <Error text="Et ole tapahtuman osallistuja" />}
            </main>
            <Toaster />
         </EventProvider>
      </NextIntlClientProvider>
   );
}

export default EventLayout;