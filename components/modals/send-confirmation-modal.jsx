"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import { format } from 'date-fns';
import { useModal } from "@/hooks/use-modal"
import { useOrigin } from "@/hooks/use-origin"

export default function SendConfirmationModal() {
   const { data: { event, user }, isOpen, onClose, type } = useModal();
   console.log(user)
   const isModalOpen = isOpen && type === "send-order-confirmation-modal";
   const [isSending, setIsSending] = useState(false);

   const origin = useOrigin();

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
                                 {console.log(event?.event_date)}
                                 <span className="text-sm">{format(new Date(event?.event_date), 'dd.MM.yyyy')}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-sm text-muted-foreground">Aika:</span>
                                 <span className="text-sm">{event?.event_time?.slice(0, 5)}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-sm text-muted-foreground">Paikka:</span>
                                 <span className="text-sm">{event?.event_location || "Ei määritelty"}</span>
                              </div>
                              <div className="flex justify-between items-start">
                                 <span className="text-sm text-muted-foreground">Linkki:</span>
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
                  onClick={() => { }}
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
