"use client"

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog"

import '../../custom.css'
import { useOrigin } from '@/hooks/use-origin';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/language-switcher';
import { useLocale } from "next-intl";
import { useEventContext } from "@/context/EventContext";
import { ArrowLeftFromLine, Info } from 'lucide-react';
import { storage } from "@/lib/appwrite/client/appwrite";
import { signOut } from "@/lib/appwrite/server/appwrite";

export default function Page({ params }) {
   const [infoModalOpen, setInfoModalOpen] = useState(false)
   const { invintation_id } = useParams();
   const t = useTranslations();
   const locale = useLocale();

   const { userData, eventData } = useEventContext();

   const [eventClientData, setEventClientData] = useState(null);
   const router = useRouter();
   const origin = useOrigin();

   return (
      <div className='text-white  h-full'>
         <section className='relative h-[300px]'>
            {userData && userData.role === "client" && (
               <Button variant="icon" className=" absolute top-5 left-5 z-10" asChild>
                  <Link href="/dashboard/events" className='bg-clientprimary hover:bg-clientprimaryhover'>
                     <ArrowLeftFromLine />
                  </Link>
               </Button>
            )}
            <LanguageSwitcher className={"absolute top-5 right-5 z-10"} />
            <Button variant="icon" className="cursor-pointer absolute top-[70px] right-5 z-20 border w-[82px] h-[42px] p-2 text-base" onClick={() => setInfoModalOpen(true)}>
               <Info className='mr-2 w-5 h-5' />
               <span>{t("f28")}</span>
            </Button>
            <img
               src="https://crossmedia.fi/holvi/poistielta/img/banner-monkija.jpg"
               alt="Monkija Banner"
               className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className='relative z-10 top-[20%]'>
               {eventData.users.clientData && eventData.users.clientData?.logo && (
                  <div className='flex justify-center w-full'>
                     <img src={storage.getFileView("logos", eventData.users.clientData.logo)} className='w-40 text-center' alt="Logo" />
                  </div>
               )}
               <h1 className='text-center font-semibold text-3xl mb-5'>{t("v1")}</h1>
               <p className='text-center text-xl text-clientprimary'>{eventData.event_name}</p>
            </div>
         </section>
         <section className="max-w-[900px] py-5 px-2 flex max-md:block items-center justify-center space-x-4 max-md:space-x-0 max-md:space-y-3 container mx-auto">
            <Button className="py-6 bg-clientprimary hover:bg-clientprimary max-md:w-full">
               <Link
                  href={`/event/${invintation_id}/feed`}
                  className='text-lg'
               >
                  {t("v2")}
               </Link>
            </Button>

            {eventData.users.clientData && eventData.users.clientData?.google_link && (
               <Button className="py-6 bg-clientprimary hover:bg-clientprimary max-md:w-full">
                  <a
                     target="_blank"
                     rel="noopener noreferrer"
                     href={eventData.users.clientData?.google_link}
                     className='text-lg'
                  >
                     {t("v3")}
                  </a>
               </Button>
            )}

            <Button className="text-lg py-6 bg-clientprimary hover:bg-clientprimary max-md:w-full" onClick={async () => await signOut()}>
               {t("v4")}
            </Button>
         </section>
         <section className='container mx-auto px-3 mb-5 max-w-[900px]'>
            {eventData.users?.clientData &&
               (
                  eventData.users?.clientData?.fi_welcome_text && locale === "fi" && (
                     <div
                        className='text-white'
                        dangerouslySetInnerHTML={{ __html: eventData.users?.clientData?.fi_welcome_text }}
                     />
                  )
               )
            }
            {eventData.users?.clientData &&
               (
                  eventData.users?.clientData?.en_welcome_text && locale === "en" && (
                     <div
                        className='text-white'
                        dangerouslySetInnerHTML={{ __html: eventData.users?.clientData?.en_welcome_text }}
                     />
                  )
               )
            }
         </section>
         <section className="container mx-auto px-3 flex my-7 text-lg max-w-[900px]">
            <div>
               {eventData?.event_time && <p>{t("v5")}</p>}
               {eventData?.event_address && <p>{t("v6")}</p>}
               {eventData?.instructions_file && <p>{t("v7")}</p>}
               {eventData?.additional_services && eventData?.additional_services?.length !== 0 && (
                  <p>{t("v8")}</p>
               )}
            </div>

            <div className='ml-10'>
               {eventData?.event_time && <p>{format(new Date(eventData.event_date), 'dd.MM.yyyy')} {eventData.event_time.slice(0, 5)}</p>}
               {eventData?.event_address && <span>{eventData?.event_address}, </span>}
               {eventData?.event_place && <span className="capitalize">{eventData?.event_place}</span>}
               {eventData?.instructions_file && (
                  <p>
                     <Link target="_blank" rel="noopener noreferrer" className='text-white text-lg block underline' href={`https://supa.crossmedia.fi/storage/v1/object/public/${eventData?.instructions_file}`}>{t("v9")}</Link>
                  </p>
               )}

               {eventData?.additional_services.length !== 0 && (
                  <div>
                     {eventData?.additional_services.join(", ")}
                  </div>
               )}
            </div>
         </section>
         <section className='container mx-auto py-3 px-3 max-w-[900px]'>
            {eventData &&
               (
                  eventData.fi_event_description && locale === "fi" && (
                     <div
                        className='text-white'
                        dangerouslySetInnerHTML={{ __html: eventData.fi_event_description }}
                     />
                  )
               )
            }
            {eventData &&
               (
                  eventData.en_event_description && locale === "en" && (
                     <div
                        className='text-white'
                        dangerouslySetInnerHTML={{ __html: eventData.en_event_description }}
                     />
                  )
               )
            }
         </section>

         <section className='container mx-auto py-3 px-3 max-w-[900px]'>
            {eventClientData &&
               (
                  eventClientData.fi_sub_description && locale === "fi" && (
                     <div
                        className='text-white'
                        dangerouslySetInnerHTML={{ __html: eventClientData.fi_sub_description }}
                     />
                  )
               )
            }
            {eventClientData &&
               (
                  eventClientData.en_sub_description && locale === "en" && (
                     <div
                        className='text-white'
                        dangerouslySetInnerHTML={{ __html: eventClientData.en_sub_description }}
                     />
                  )
               )
            }
         </section>

         <Dialog onOpenChange={setInfoModalOpen} open={infoModalOpen} className="">
            <div className="rounded-md overflow-hidden">
               <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="!text-left">
                     <DialogTitle>{t("f2")}</DialogTitle>
                     <DialogDescription>
                     </DialogDescription>
                     <div className="mt-2">
                        <h3 className="font-bold underline mb-2">{t("f3")}</h3>
                        <div className="ml-10">
                           <span className="leading-tight block mb-3">{t("f4")}</span>
                           <p className="leading-tight mb-2">{t("f5")}</p>
                           <p className="leading-tight mb-2">{t("f6")}</p>
                           <p className="leading-tight">{t("f7")}</p>
                        </div>
                     </div>
                     <div className="mt-2">
                        <h3 className="font-bold underline mb-2">{t("f8")}</h3>
                        <div className="ml-10">
                           <p className="font-medium mb-1">{t("f9")}</p>
                           <ul className="list-disc list-inside marker:text-black ml-5 mb-2">
                              <li className="leading-tight">{t("f10")}</li>
                           </ul>
                           <p className="font-medium mb-1">{t("f11")}</p>
                           <ul className="list-disc list-inside marker:text-black mb-2">
                              <li className="leading-tight mb-1">{t("f12")}</li>
                              <li className="leading-tight">{t("f13")}</li>
                           </ul>
                           <p className="font-medium mb-1">{t("f14")}</p>
                           <ul className="list-disc list-inside marker:text-black mb-2">
                              <li className="leading-tight mb-1">{t("f15")} <img src="/comment.png" className="w-10 h-8 inline" /></li>
                              <li className="leading-tight mb-1">{t("f16")}</li>
                              <li className="leading-tight">{t("f17")}</li>
                           </ul>
                           <p className="font-medium mb-1">{t("f18")}</p>
                           <ul className="list-disc list-inside marker:text-black mb-2">
                              <li className="leading-tight mb-1">{t("f19")} <img src="/favorites.png" className="w-10 h-8 inline" /></li>
                              <li className="leading-tight mb-1">{t("f20")}</li>
                           </ul>
                           <p className="font-medium mb-1">{t("f21")}</p>
                           <ul className="list-disc list-inside marker:text-black mb-2">
                              <li className="leading-tight">{t("f22")} <img src="/share.png" className="w-10 h-8 inline" /> {t("f23")}</li>
                           </ul>
                           <p className="font-medium mb-1">{t("f24")}</p>
                           <ul className="list-disc list-inside marker:text-black mb-2">
                              <li className="leading-tight">{t("f25")}</li>
                           </ul>
                           <p className="font-medium mb-1">{t("f26")}</p>
                           <ul className="list-disc list-inside marker:text-black mb-2">
                              <li className="leading-tight">{t("f27")}</li>
                           </ul>
                        </div>
                     </div>
                  </DialogHeader>
               </DialogContent>
            </div>

         </Dialog>

      </div>
   );
}

