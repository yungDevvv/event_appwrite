"use client";

import { useState } from 'react';
import { Button } from '../../ui/button';

import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createDocument, updateDocument } from '@/lib/appwrite/server/appwrite';

const SettingsGoogleForm = ({ recordExists, user, google_link }) => {
   const [inputValue, setInputValue] = useState(google_link !== null ? google_link : "");


   const { toast } = useToast();

   ;
   const router = useRouter();



   const handleSubmit = async () => {
      if (recordExists === false) {
         const { error } = await createDocument("main_db", "client_data", {
            body: {
               users: user.$id,
               google_link: inputValue
            }
         })

         if (error) {
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tiedon tallentamisessa."
            })
            return;
         }

         toast({
            variant: "success",
            title: "Linkki",
            description: "Linkin tallentaminen onnistui."
         })
      } else {
         const { error } = await updateDocument("main_db", "client_data", user.clientData.$id, {
            google_link: inputValue
         })

         if (error) {
            console.log(error);
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tiedon päivittämisessa."
            })
            return;
         }

         toast({
            variant: "success",
            title: "Linkki",
            description: "Linkin päivittäminen onnistui."
         })
      }
   }

   return (
      <div className='w-full'>
         <div className='w-full'>
            <h1 className='font-semibold'>Google arvostelun linkki</h1>
            <p className='text-zinc-600 leading-tight'>Lisää tähän oma googlen arvostelulinkkisi, arvostelupainike näkyy palvelun etusivulla.</p>
         </div>
         <div className="w-full mt-5">
            <div className='w-full max-w-[50%] max-md:max-w-full'>
               <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="bg-white"
               />
            </div>
            <Button
               onClick={handleSubmit}
               className="bg-orange-400 hover:bg-orange-500 mt-2"
            >
               Tallenna
            </Button>
         </div>
      </div>
   );
}

export default SettingsGoogleForm;