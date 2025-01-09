"use client"

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog"

import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import '../../custom.css'
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/language-switcher';
import { useLocale } from "next-intl";
import { useEventContext } from "@/context/EventContext";
import { ArrowLeftFromLine, Calendar, FileText, Info, MapPin, Smile, LogOut } from 'lucide-react';
import { storage } from "@/lib/appwrite/client/appwrite";

import SVGComponent from "@/components/svg-image";

export default function Page({ params }) {
   const [infoModalOpen, setInfoModalOpen] = useState(false);
   const [confirmLogoutModalOpen, setConfirmLogoutModalOpen] = useState(false);

   const { invintation_id } = useParams();
   const t = useTranslations();
   const locale = useLocale();

   const { userData, eventData } = useEventContext();

   const router = useRouter();

   return (
      <div className='text-white min-h-screen'>
         <div className="pb-20 max-sm:pb-12">
            <div className="relative min-h-[320px] h-[30vh] flex items-center justify-center" >
               <img
                  src="https://crossmedia.fi/holvi/poistielta/img/banner-monkija.jpg"
                  alt="Monkija Banner"
                  className="absolute inset-0 w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/80 to-black/30" />

               {/* Navigation Secondery */}
               <nav className="absolute top-3 right-3 z-50 flex flex-col gap-3">
                  {userData?.role === "client" ? (
                     <Button variant="icon" className="text-sm flex-1 bg-[#FF8F00] hover:bg-[#FFA726] transition-all shadow-lg shadow-orange-900/20" asChild>
                        <Link href="/dashboard/events">
                           <ArrowLeftFromLine className="w-5 h-5 mr-2" />
                        </Link>
                     </Button>
                  ) : (
                     <Button
                        className="text-sm flex-1 bg-[#FF8F00] hover:bg-[#FFA726] transition-all shadow-lg shadow-orange-900/20"
                        onClick={() => {
                           // router.push(`/logout`)
                           setConfirmLogoutModalOpen(true)
                        }}
                     >
                        <LogOut className="w-5 h-5" />
                     </Button>
                  )}
                  <Button variant="icon" className="bg-[#FF8F00] hover:bg-[#FFA726] transition-all flex-1" onClick={() => setInfoModalOpen(true)}>
                     <Info className='w-5 h-5' />
                  </Button>
                  <LanguageSwitcher className="flex-1" />
               </nav>
               <div className='relative z-10 px-4 text-center'>
                  {eventData.users.clientData && eventData.users.clientData?.logo && (
                     <SVGComponent
                        url={storage.getFileView("logos", eventData.users.clientData?.logo)}
                        className='w-[230px] mx-auto mb-4 drop-shadow-2xl'
                     />
                  )}
                  <h1 className='font-bold text-3xl mb-2 drop-shadow-lg'>{t("v1")}</h1>
                  <p className='text-xl text-[#FF8F00] font-medium'>{eventData.event_name}</p>
               </div>
            </div>

            <div className="px-4 py-8 bg-black/10 backdrop-blur-sm">
               <div className="max-w-[900px] mx-auto grid gap-8">
                  {/* Navigation */}
                  <div className="flex gap-4 max-sm:flex-col">
                     <Button className="w-full py-6 bg-[#FF8F00] hover:bg-[#FFA726] transition-all shadow-lg shadow-orange-900/20">
                        <Link href={`/event/${invintation_id}/feed`} className='text-base font-medium'>
                           {t("v2")}
                        </Link>
                     </Button>

                     {eventData.users.clientData && eventData.users.clientData?.google_link && (
                        <Button className="w-full py-6 bg-[#FF8F00] hover:bg-[#FFA726] transition-all shadow-lg shadow-orange-900/20">
                           <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={eventData.users.clientData?.google_link}
                              className='text-base font-medium'
                           >
                              {t("v3")}
                           </a>
                        </Button>
                     )}
                  </div>

                  <div className="prose prose-invert max-w-none">
                     {eventData.users?.clientData && (
                        locale === "fi" ? (
                           <div dangerouslySetInnerHTML={{ __html: eventData.users.clientData.fi_welcome_text }} />
                        ) : (
                           <div dangerouslySetInnerHTML={{ __html: eventData.users.clientData.en_welcome_text }} />
                        )
                     )}
                  </div>


                  <div className="bg-[#0a0a0a] rounded-xl p-6 space-y-6 border border-zinc-900">
                     <h3 className="text-lg font-medium">Paikka ja aika</h3>
                     <div className="grid gap-4">
                        <div className="flex items-center space-x-4">
                           <span className="text-lg"><Calendar className="text-[#FF8F00]" /></span>
                           {eventData?.event_time && (
                              <p className="text-lg">{format(new Date(eventData.event_date), 'dd.MM.yyyy')} {eventData.event_time.slice(0, 5)}</p>
                           )}
                        </div>

                        <div className="flex items-center space-x-4">
                           <span className="text-lg"><MapPin className="text-[#FF8F00]" /></span>
                           <div>
                              {eventData?.event_address && <span>{eventData?.event_address}, </span>}
                              {eventData?.event_place && <span className="capitalize">{eventData?.event_place}</span>}
                           </div>
                        </div>

                        {eventData?.instructions_file && (
                           <div className="flex items-center space-x-4">
                              <span className="text-lg">
                                 <FileText className="text-[#FF8F00]" />
                              </span>
                              <Link
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className='text-white hover:text-[#FF8F00] transition-colors underline underline-offset-4'
                                 href={storage.getFileView("instructions_files", eventData?.instructions_file)}
                              >
                                 {t("v9")}
                              </Link>
                           </div>
                        )}

                        {eventData?.additional_services && eventData?.additional_services?.length !== 0 && (
                           <div className="flex items-center space-x-4">
                              <span className="text-lg"><Smile className="text-[#FF8F00]" /></span>
                              <div>
                                 {eventData?.additional_services.join(", ")}
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
                  <div className="bg-[#0a0a0a] rounded-xl p-6 space-y-6 border border-zinc-900">
                     <div className="prose prose-invert max-w-none">
                        {eventData && (
                           locale === "fi" ? (
                              <div dangerouslySetInnerHTML={{ __html: eventData.fi_event_description }} />
                           ) : (
                              <div dangerouslySetInnerHTML={{ __html: eventData.en_event_description }} />
                           )
                        )}
                     </div>
                  </div>
                  <div className="prose prose-invert max-w-none">
                     {eventData.users?.clientData && (
                        locale === "fi" ? (
                           <div dangerouslySetInnerHTML={{ __html: eventData.users?.clientData.fi_sub_description }} />
                        ) : (
                           <div dangerouslySetInnerHTML={{ __html: eventData.users?.clientData.en_sub_description }} />
                        )
                     )}
                  </div>
               </div>
            </div>
         </div>
         <AlertDialog open={confirmLogoutModalOpen} onOpenChange={setConfirmLogoutModalOpen}>
            <AlertDialogContent className="max-w-sm">
               <AlertDialogHeader>
                  <AlertDialogTitle>Olet kirjautumassa ulos</AlertDialogTitle>
                  <AlertDialogDescription>

                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel>{t("r7")}</AlertDialogCancel>
                  <AlertDialogAction className="bg-[#FF8F00] hover:bg-[#FFA726]" onClick={() => router.push(`/logout`)}>{t("v4")}</AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
         <Dialog onOpenChange={setInfoModalOpen} open={infoModalOpen}>
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
