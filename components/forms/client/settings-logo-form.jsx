"use client";

import { useRef, useState } from 'react';
import { Button } from '../../ui/button';

import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { createDocument, createFile, updateDocument } from '@/lib/appwrite/server/appwrite';
import { storage } from '@/lib/appwrite/client/appwrite';

const SettingsLogoForm = ({ recordExists, user, logo }) => {
   const [selectedFile, setSelectedFile] = useState(null);

   const { toast } = useToast();

   const router = useRouter();
   const fileInputRef = useRef(null);

   const handleFileChange = (event) => {
      const file = event.target.files?.[0];
      if (file) {
         const imageUrl = URL.createObjectURL(file);
         setSelectedFile({ file, preview: imageUrl });
      }
   };

   async function handleSubmit() {

      let fileId = null;

      if (selectedFile?.file) {
         fileId = await createFile("logos", selectedFile?.file);
      }

      if (recordExists) {
         const { error } = await updateDocument("main_db", "client_data", user.clientData.$id, {
            logo: fileId
         });

         if (error) {
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe logon latauksessa varastoon.",
            });
            return;
         }

      } else {

         const { error } = await createDocument("main_db", "client_data", {
            users: user.$id,
            logo: fileId
         });

         if (error) {
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe logon latauksessa varastoon.",
            });
            return;
         }
      }

      toast({
         variant: "success",
         title: "Logo",
         description: "Logo on tallennettu onnistuneesti."
      });

      router.refresh();
   }

   return (
      <div className='flex'>
         <div>
            <h1 className='font-semibold'>Yrityksen logo</h1>
            <p className='text-zinc-600 leading-tight'>Lataa oma yrityksesi logo.</p>
            <div className='mt-4'>
               <Button className="mr-2 mt-auto" onClick={() => fileInputRef.current?.click()}>
                  <label
                     htmlFor="logo-upload"
                     className="cursor-pointer w-full h-full"
                  >
                     {selectedFile?.file ? <span className='italic'>{selectedFile.file.name}</span> : <span>Lataa logo</span>}
                  </label>
                  <input
                     type="file"
                     id="logo-upload"
                     ref={fileInputRef}
                     onChange={handleFileChange}
                     accept="image/*"
                     className="hidden" // Hides the file input
                  />
               </Button>
               {selectedFile && (
                  <Button
                     onClick={handleSubmit}
                     className="bg-orange-400 hover:bg-orange-500 mt-4"
                  >
                     Tallenna
                  </Button>
               )}
            </div>
         </div>
         <div className='max-w-[150px] w-full relative ml-10'>
            {selectedFile?.file && <X onClick={() => {
               setSelectedFile(null);
            }} size={18} className="absolute -top-2 -right-2 cursor-pointer" />}
            {selectedFile?.preview && <img src={selectedFile.preview} alt="company_logo1" />}
   
            {selectedFile === null && user.clientData?.logo && <img src={storage.getFilePreview("logos", user.clientData.logo)} alt="company_logo" />}
         </div>
      </div>
   );
}

export default SettingsLogoForm;