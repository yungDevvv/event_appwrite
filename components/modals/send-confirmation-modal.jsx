"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import { format } from 'date-fns';
import { useModal } from "@/hooks/use-modal"
import { useOrigin } from "@/hooks/use-origin"
import { mauticEmailService } from "@/lib/mautic/mautic"

export default function SendConfirmationModal() {
   const { data: { event, user }, isOpen, onClose, type } = useModal();

   const isModalOpen = isOpen && type === "send-order-confirmation-modal";
   const [isSending, setIsSending] = useState(false);

   const origin = useOrigin();

   const handleSend = async () => {
      try {
         setIsSending(true);
         await mauticEmailService.sendEmail({
            // reciever_email: event?.contact_email || '',
            reciever_email: event?.contact_email || '',
            reciever_name: event?.contact_person || '',
            content: emailTemplate,
            team_name: "Pois Tieltä Oy"
         });
         setIsSending(false);
         onClose();
      } catch (error) {
         console.error('Virhe sähköpostin lähetyksessä:', error);
         setIsSending(false);
      }
   }

   const adHTML = `
      <div style="margin-top: 10px; padding-top:10px; border-top: 1px solid #ccc;">
         <h2 style="font-size: 18px; margin-bottom: 10px;">Tapahtuman tiedot:</h2>
         <p style="font-size: 16px;"><strong>Aika:</strong> ${format(new Date(event?.event_date), 'dd.MM.yyyy')} klo ${event?.event_time?.slice(0, 5)}</p>
         <p style="font-size: 16px;"><strong>Paikka:</strong> ${event?.event_address}, ${event?.event_place}</p>
         <p style="font-size: 16px;"><strong>Rekisteröintilinkki:</strong>  <a href="${`${origin}/register-for-event/${event?.invintation_id}`}" target="_blank">${`${origin}/register-for-event/${event?.invintation_id}`}</a></p>
         <div style="font-size: 16px; margin-top: 10px; border-top: 1px solid #ccc; padding-top: 10px;"> <div>${event?.fi_event_description}</div></div>
      </div>
   `

   const emailTemplate = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
         ${user?.clientData?.order_confirmation || ''}
         ${adHTML}
      </div>
   `.trim().replace(/\s+/g, ' ');

   
   return (
      <Dialog open={isModalOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-[600px] w-full min-h-[400px] flex flex-col">
            <DialogHeader>
               <DialogTitle>Lähetä tilausvahvistus</DialogTitle>
               <DialogDescription>
                  Esikatsele ja lähetä tilausvahvistus sähköpostitse
               </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="preview" className="w-full flex-1 flex flex-col">
               <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Esikatselu</TabsTrigger>
                  <TabsTrigger value="details">Lähetystiedot</TabsTrigger>
               </TabsList>

               <div className="flex-1 overflow-auto">
                  <TabsContent value="preview" className="mt-4 h-full">
                     <div className="bg-muted p-4 rounded-lg h-full">
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: user?.clientData?.order_confirmation }} />
                        <div dangerouslySetInnerHTML={{ __html: adHTML }} />
                     </div>
                  </TabsContent>

                  <TabsContent value="details" className="mt-4 h-full">
                     <div className="space-y-4">
                        <div>
                           <h4 className="text-sm font-medium mb-2">Vastaanottaja</h4>
                           <div className="bg-muted p-3 rounded-md">
                              <p className="text-sm">{event?.contact_person}</p>
                              <p className="text-sm text-muted-foreground">{event?.contact_email}</p>
                           </div>
                        </div>

                        <div>
                           <h4 className="text-sm font-medium mb-2">Aika, paikka, sekä linkki</h4>
                           <div className="bg-muted p-3 rounded-md space-y-2">
                              <div className="flex justify-between">
                                 <span className="text-sm text-muted-foreground">Päivämäärä:</span>

                                 <span className="text-sm">{format(new Date(event?.event_date), 'dd.MM.yyyy')}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-sm text-muted-foreground">Aika:</span>
                                 <span className="text-sm">{event?.event_time?.slice(0, 5)}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-sm text-muted-foreground">Paikka:</span>
                                 <span className="text-sm">{event?.event_address}, {event?.event_place}</span>
                              </div>
                              <div className="flex justify-between items-start">
                                 <span className="text-sm text-muted-foreground">Linkki: </span>
                                 <span className="text-sm text-right">
                                    <a
                                       href={`${origin}/register-for-event/${event?.invintation_id}`}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="text-blue-500 hover:underline break-all"
                                    >
                                       {`${origin}/register-for-event/${event?.invintation_id}`}
                                    </a>
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </TabsContent>
               </div>
            </Tabs>

            <div className="flex justify-end gap-3 mt-4">
               <Button variant="outline" onClick={onClose}>
                  Peruuta
               </Button>

               <Button
                  onClick={() => handleSend()}
                  disabled={isSending}
                  className="bg-orange-500 hover:bg-orange-600"
               >
                  {isSending ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     </>
                  ) : (
                     <>
                        Lähetä tilausvahvistus
                     </>
                  )}
               </Button>
            </div>
         </DialogContent>
      </Dialog>
   )
}
