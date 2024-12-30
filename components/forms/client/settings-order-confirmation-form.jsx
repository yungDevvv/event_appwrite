"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { updateDocument } from "@/lib/appwrite/server/appwrite";

const CKeditor = dynamic(() => import('@/components/ck-editor'), {
   ssr: false,
   loading: () => <div className='w-full min-h-[190px] flex justify-center items-center py-10'><Loader2 className='animate-spin text-clientprimary' /></div>
});

const formSchema = z.object({
   order_confirmation: z.any(),
});

export default function OrderConfirmationForm({ user, recordExists, order_confirmation }) {
   const { toast } = useToast();
   const [orderConfirmationText, setOrderConfirmationText] = useState(order_confirmation ? order_confirmation : "");

   const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
         order_confirmation: orderConfirmationText,
      },
   });

   const handleChange = (event, editor) => {
      const data = editor.getData();
      setOrderConfirmationText(data);
   };

   async function onSubmit(data) {
      if (!recordExists) {
         const { error: createError } = await updateDocument("main_db", "client_data", {
            users: user.$id,
            body: {
               order_confirmation: JSON.stringify(orderConfirmationText),
            }
         });

         if (createError) {
            toast({
               variant: "destructive",
               description: "Jotain meni vikaan. Yritä uudelleen myöhemmin.",
            });
            return;
         }

         toast({
            variant: "success",
            description: "Tilausvahvistus on tallennettu onnistuneesti.",
         });

         return;
      }

      const { error: updateError } = await updateDocument("main_db", "client_data", user.clientData.$id, {
         order_confirmation: JSON.stringify(orderConfirmationText),
      });

      if (updateError) {
         toast({
            variant: "destructive",
            description: "Jotain meni vikaan. Yritä uudelleen myöhemmin.",
         });
         return;
      }

      toast({
         variant: "success",
         description: "Tilausvahvistus on päivitetty onnistuneesti.",
      });
   }

   return (
      <div className="bg-white rounded-lg">
         <div className="flex items-center justify-between mb-4">
            <div>
               <h2 className="text-lg font-medium">Tilausvahvistus</h2>
               <p className="text-sm text-gray-500">
                  Tämä teksti näytetään asiakkaalle tilausvahvistuksessa.
               </p>
            </div>
         </div>
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <div className="w-full">
                  <CKeditor
                     content={orderConfirmationText}
                     handleChange={handleChange}
                     editorType="large"
                  />
               </div>
               <Button
                  type="submit"
                  className="bg-clientprimary hover:bg-clientprimaryhover"
                  disabled={form.formState.isSubmitting}
               >
                  {form.formState.isSubmitting && (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Tallenna
               </Button>
            </form>
         </Form>
      </div>
   );
}