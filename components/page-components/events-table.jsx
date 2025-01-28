"use client"

import {
   Table,
   TableBody,
   TableCaption,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table"

import {
   Menubar,
   MenubarContent,
   MenubarItem,
   MenubarMenu,
   MenubarSub,
   MenubarSubContent,
   MenubarSubTrigger,
   MenubarTrigger,
} from "@/components/ui/menubar"

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

import { format } from 'date-fns';
import { Check, Copy, Delete, EllipsisVertical, Eye, ImageOff, ImagePlay, Images, Pencil, PencilRuler, ShieldAlert, UserRound, Link as LucideLink, MailPlus, QrCode } from "lucide-react";
import { forwardRef, useState, useEffect, Fragment } from "react";
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation";
import { useOrigin } from "@/hooks/use-origin";
import Link from "next/link";
import { useModal } from "@/hooks/use-modal";
import { Button } from "../ui/button";
import { getDocument, deleteDocument, updateDocument } from "@/lib/appwrite/server/appwrite";


const EventsTable = ({ user }) => {
   const [copied, setCopied] = useState(false);
   const [tab, setTab] = useState();
   const [openDropdownId, setOpenDropdownId] = useState(null);

   const { toast } = useToast()
   const router = useRouter();
   const origin = useOrigin();
   const { onOpen } = useModal();

   const deleteEvent = async (eventId) => {
      const { error } = await deleteDocument("main_db", "events", eventId);

      if (error) {
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe tapahtuman poistaessa."
         });
         return;
      }

      router.refresh();

      toast({
         variant: "success",
         title: "Tapahtuma",
         description: "Tapahtuma on poistettu onnistuneesti."
      })
   }

   const onCopy = (invintation_id) => {
      const inviteUrl = `${origin}/register-for-event/${invintation_id}`;

      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);

      setTimeout(() => {
         setCopied(false);
      }, 1000)
   }

   const stopDiaesitys = async (event_id) => {
      const { error } = await updateDocument("main_db", "events", event_id, { diaesitys: false });

      if (error) {
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe diaesityksen tilan päivittämisessä."
         });
         return;
      }

      router.refresh();

      toast({
         variant: "success",
         title: "Diaesitys",
         description: "Diaesitys on nyt pysäytetty!"
      })
   }

   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
      setIsClient(true);

   }, []);

   if (!isClient) {
      return null;
   }

   return (
      <>
         <div className="text-left max-md:text-right max-md:inline-block max-md:float-right">
            <Button className="bg-orange-400 hover:bg-orange-500 mb-3" onClick={() => onOpen("create-event", { edit: false })}>Uusi tapahtuma</Button>
         </div>
         <div className="overflow-x-auto w-full">
            <Table className="min-w-full table-auto">
               <TableCaption>
                  {user.events.length === 0 && "Ei luotuja tapahtumia"}
               </TableCaption>
               <TableHeader>
                  <TableRow>
                     <TableHead className="whitespace-nowrap">Asiakkaan nimi</TableHead>
                     <TableHead className="whitespace-nowrap">Nimi</TableHead>
                     <TableHead className="whitespace-nowrap">Tyyppi</TableHead>
                     <TableHead className="whitespace-nowrap">Päivämäärä ja aika</TableHead>
                     <TableHead className="whitespace-nowrap">Osallistujat</TableHead>
                     <TableHead className="whitespace-nowrap">Lisäpalvelut</TableHead>
                     <TableHead className="whitespace-nowrap">Ryhmän koko</TableHead>
                     <TableHead className="whitespace-nowrap">Diaesitys</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {user.events.length !== 0
                     && user.events.map(event => (
                        <TableRow key={event.$id}>

                           <TableCell className="font-medium whitespace-nowrap">{event.client_name}</TableCell>
                           <TableCell className="font-medium whitespace-nowrap">{event.event_name}</TableCell>
                           <TableCell className="capitalize whitespace-nowrap">{event.event_type}</TableCell>
                           <TableCell className="whitespace-nowrap">{format(new Date(event.event_date), 'dd.MM.yyyy')} {event.event_time.slice(0, 5)}</TableCell>
                           <TableCell className="whitespace-nowrap">{event.event_member.length}</TableCell>
                           <TableCell className="max-w-[100px] truncate whitespace-nowrap">
                              {
                                 event.additional_services?.length
                                    ? event.additional_services.join(", ")
                                    : "Ei ole"
                              }
                           </TableCell>
                           <TableCell className="whitespace-nowrap">{event.group_size}</TableCell>
                           <TableCell className="whitespace-nowrap">{event.diaesitys ? <div className="w-[7px] h-[7px] bg-green-500 rounded-full animate-glow ml-6"></div> : <div className="w-[7px] h-[7px] bg-red-500 rounded-full ml-6"></div>}</TableCell>
                           <TableCell className="text-right whitespace-nowrap">
                              <Menubar className="!bg-transparent border-0 h-fit w-fit shadow-none">
                                 <MenubarMenu>
                                    <MenubarTrigger onClick={() => setTab(event.$id)} asChild>
                                       <Button className="hover:bg-zinc-200 p-1 rounded-md relative cursor-pointer" variant="icon">
                                          {event.event_posts.filter(post => post.is_reported === true && post.report_status === "waiting")?.length !== 0 && openDropdownId !== event.$id && (
                                             <div className="bg-red-500 text-white rounded-full absolute w-4 h-4 flex items-center justify-center -top-1 -right-1" title="Ilmiannetut julkaisut">
                                                {event.event_posts.filter(post => post.is_reported === true && post.report_status === "waiting")?.length}
                                             </div>
                                          )}
                                          <EllipsisVertical />
                                       </Button>
                                    </MenubarTrigger>
                                    <MenubarContent side="left" aling={"start"} alignOffset={-70}>
                                       <MenubarSub>
                                          <MenubarSubTrigger>
                                             <PencilRuler size={18} className="mr-2" />
                                             <span>Toiminnot</span>
                                          </MenubarSubTrigger>
                                          <MenubarSubContent alignOffset={-5} sideOffset={5} collisionPadding={20}>
                                             <MenubarItem className="flex items-center" onClick={() => {
                                                onOpen("create-event", { edit: true, event: event })
                                                setOpenDropdownId(null);
                                             }}>
                                                <Pencil size={18} className="mr-2" />
                                                <span>Muokkaa</span>
                                             </MenubarItem>
                                             <MenubarItem asChild>
                                                <ConfirmDialog deleteEvent={deleteEvent} eventId={event.$id} />
                                             </MenubarItem>
                                             <MenubarItem className="flex items-center" onClick={() => {
                                                onOpen("create-event", { edit: false, duplicate: true, event: event })
                                                setOpenDropdownId(null);
                                             }}>
                                                <Copy size={18} className="mr-2" />
                                                <span>Duplicate</span>
                                             </MenubarItem>
                                          </MenubarSubContent>
                                       </MenubarSub>

                                       <MenubarItem className="text-sm" onClick={async () => {
                                          onOpen("send-order-confirmation-modal", { event, user })
                                          setOpenDropdownId(null);
                                       }}>
                                          <MailPlus size={18} className="mr-2" />
                                          <span>Lähetä tilausvahvistus</span>
                                       </MenubarItem>

                                       <MenubarItem className="text-sm" asChild>
                                          <Link className="flex" href={"/event/" + event.invintation_id}>
                                             <Eye size={18} className="mr-2" />
                                             <span>Näytä</span>
                                          </Link>
                                       </MenubarItem>
                                       <MenubarItem className="text-sm" asChild>
                                          <Link className="flex" href={"/dashboard/events/" + event.invintation_id + "/qr"}>
                                             <QrCode size={18} className="mr-2" />
                                             <span>QR-koodi</span>
                                          </Link>
                                       </MenubarItem>
                                       <MenubarItem className="text-sm" onClick={() => onCopy(event.invintation_id)}>
                                          {copied ? <Check size={18} className="mr-2" /> : <LucideLink size={18} className="mr-2" />}
                                          <span>Kopioi kutsulinkki</span>
                                       </MenubarItem>

                                       <MenubarItem className="text-sm" onClick={async () => {
                                          onOpen("event-members-list", { event: await getDocument("main_db", "events", event.$id), user_id: user.$id })
                                          setOpenDropdownId(null);
                                       }}>
                                          <UserRound size={18} className="mr-2" />
                                          <span>Osallistujat</span>
                                       </MenubarItem>

                                       <MenubarItem className="text-sm relative" asChild>
                                          <Link className="flex" href={"/dashboard/events/" + event.$id + "/reports"}>
                                             <ShieldAlert size={18} className="mr-2" />
                                             <span>Ilmiannetut julkaisut</span>
                                             {event.event_posts.filter(post => post.is_reported === true && post.report_status === "waiting")?.length !== 0 && (
                                                <div className="bg-red-500 text-white rounded-full absolute w-4 h-4 flex items-center justify-center -top-1 -right-1" title="Ilmiannetut julkaisut">
                                                   {event.event_posts.filter(post => post.is_reported === true && post.report_status === "waiting")?.length}
                                                </div>
                                             )}
                                          </Link>
                                       </MenubarItem>

                                       {event.diaesitys
                                          ? (
                                             <Fragment>
                                                <MenubarItem className="text-sm" onClick={() => {
                                                   stopDiaesitys(event.$id);
                                                   setOpenDropdownId(null);
                                                }}>
                                                   <ImageOff size={18} className="mr-2" />
                                                   <span>Pysähdy diaesitys</span>
                                                </MenubarItem>
                                                <MenubarItem className="text-sm" onClick={() => {
                                                   router.push("/dashboard/events/" + event.$id + "/diaesitys/slider")
                                                   setOpenDropdownId(null);
                                                }}>
                                                   <ImagePlay size={18} className="mr-2" />
                                                   <span>Diaesitys</span>
                                                </MenubarItem>
                                             </Fragment>

                                          ) : (
                                             <Link href={`/dashboard/events/${event.$id}/diaesitys`}>
                                                <MenubarItem className="text-sm" onClick={() => {
                                                }}>
                                                   <Images size={18} className="mr-2" />
                                                   <span>Aloita diaesitys</span>
                                                </MenubarItem>
                                             </Link>
                                          )
                                       }
                                    </MenubarContent>
                                 </MenubarMenu>
                              </Menubar>
                           </TableCell>
                        </TableRow>
                     ))
                  }
               </TableBody>
            </Table>
         </div>

      </>
   )
}

const ConfirmDialog = forwardRef(({ deleteEvent, eventId }, ref) => {
   return (
      <AlertDialog>
         <AlertDialogTrigger ref={ref} className="relative w-full cursor-default select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 flex items-center">
            <Delete size={18} className="mr-2" />
            <span>Poista</span>
         </AlertDialogTrigger>
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>Oletko varma?</AlertDialogTitle>
               <AlertDialogDescription>
                  Tätä toimintoa ei voida peruuttaa. Tämä poistaa pysyvästi tapahtumasi ja kaikki siihen liittyvät tiedot palvelimiltamme.
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel>Peruuta</AlertDialogCancel>
               <AlertDialogAction onClick={() => deleteEvent(eventId)} className="bg-red-500 hover:bg-red-600 text-white">Kyllä, poista</AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   )
})

ConfirmDialog.displayName = "ConfirmDialog";

export default EventsTable;
