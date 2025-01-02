import { Error } from "@/components/ui/error";
import { Toaster } from "@/components/ui/toaster";
import { EventProvider } from "@/context/EventContext";
import { getDocument, getLoggedInUser } from "@/lib/appwrite/server/appwrite";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import Link from "next/link";

async function EventLayout({ children, params }) {
   const { invintation_id } = await params;
   const messages = await getMessages();

   const user = await getLoggedInUser();

   const { data: event, error: eventError } = await getDocument('main_db', 'events', invintation_id)

   if (eventError) {
      if (eventError.code === 404) {
         return <Error
            title="Tapahtuma ei ole olemassa"
         />
      }
      return <Error text="500 Internal Server Error" />
   }

   const eventData = event;
   const userData = user;

   const isMember = userData && eventData.event_member.find((member) => member.users.$id === userData.$id)



   return (
      <NextIntlClientProvider messages={messages}>
         <EventProvider value={{ eventData, userData }}>
            <main className="w-full h-full min-h-screen bg-black">
               {isMember && children}
               {!isMember && (
                  <Error
                     title="Et ole tapahtuman osallistuja"
                     description="Valitettavasti sinulla ei ole pääsyä tähän tapahtumaan. Ole hyvä ja rekisteröidy ensin."
                     linkText="Siirry rekisteröitymissivulle"
                     linkUrl={"/register-for-event/" + invintation_id}
                  />
               )}
            </main>
            <Toaster />
         </EventProvider>
      </NextIntlClientProvider>
   );
}

export default EventLayout;