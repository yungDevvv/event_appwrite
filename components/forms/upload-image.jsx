"use client"

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Camera, Loader2, X } from "lucide-react";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { createDocument, createFile } from "@/lib/appwrite/server/appwrite";
import { storage, ID } from "@/lib/appwrite/client/appwrite";

export default function UploadImage({ user_id, event_id, mutate }) {
   const [image, setImage] = useState(null);
   const [loading, setLoading] = useState(false);
   const [previewUrl, setPreviewUrl] = useState(null);
   const [fileType, setFileType] = useState(null);
   const t = useTranslations();
   const router = useRouter();
   const { toast } = useToast();

   const handleImageChange = (e) => {
      const selectedFile = e.target.files[0];

      if (selectedFile) {
         const maxSizeInBytes = 50 * 1024 * 1024; // 50 MB
         const fileType = selectedFile.type.split('/')[0]; // получаем 'image' или 'video'

         if (selectedFile.size > maxSizeInBytes) {
            toast({
               variant: "destructive",
               title: "Virhe: Kuvan koko ei saa olla suurempi kuin 50 MB!",
            });
            return;
         }

         if (fileType !== 'image' && fileType !== 'video') {
            toast({
               variant: "destructive",
               title: "Virhe: Vain kuvat ja videot ovat sallittuja!",
            });
            return;
         }

         setImage(selectedFile);
         setFileType(fileType);
         setPreviewUrl(URL.createObjectURL(selectedFile));
      }
   };

   const uploadImage = async () => {
      const uniqueId = ID.unique();
      try {
         setLoading(true);

         if (!image) return;

         // let fileId = await createFile("event_images", image);
         let fileId = await storage.createFile("event_images", uniqueId, image);

         const { error: createdEventError } = await createDocument("main_db", "event_posts", {
            body: {
               users: user_id,
               events: event_id,
               image_url: fileId.$id
            }
         });


         if (createdEventError) {
            console.log(createdEventError)
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe kuvan latauksessa."
            });

            return;
         }

         toast({
            variant: "success",
            title: "Kuva",
            description: "Kuva on lähetetty onnistuneesti!"
         });

      } catch (error) {
         console.log('Error uploading image:', error.message);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe kuvan latauksessa."
         });
      } finally {
         router.refresh();
         setLoading(false);
         setImage(null);
         setPreviewUrl(null);
         setFileType(null);
      }
   };

    
   return (
      <>
         <Button variant="outline" size={"icon"} className="cursor-pointer" asChild>
            <label htmlFor="dropzone-file" className="w-full h-auto border-none cursor-pointer flex justify-center items-center bg-transparent hover:bg-transparent">
               <div className="border-4 border-clientprimary rounded-full p-4 bg-orange-100 bg-opacity-20 backdrop-blur-sm">
                  <Camera size={48} className="text-clientprimary" />
               </div>
               <input id="dropzone-file" type="file" className="hidden" accept="image/*, video/*" onChange={handleImageChange} />
            </label>
         </Button>
         <AlertDialog open={image ? true : false}>
            <AlertDialogContent>
               <AlertDialogHeader className="relative flex flex-row items-center justify-between">
                  <AlertDialogTitle>Lähetä kuva</AlertDialogTitle>
                  <AlertDialogDescription></AlertDialogDescription>
                  <button onClick={() => {
                     setImage(null);
                     setPreviewUrl(null);
                     setFileType(null);
                  }}
                     variant="outline"
                     className=" !p-0 !m-0"
                  >
                     <X />
                  </button>
               </AlertDialogHeader>
               <div className="my-1 w-full h-full max-h-[450px] aspect-[3/4]">
               {fileType === "video" && (
                  <video 
                     autoPlay 
                     muted 
                     loop 
                     controls 
                     className="rounded-xl w-full h-full object-cover" 
                     src={previewUrl} 
                  />
               )}
               {fileType === "image" && (
                  <img 
                     className="rounded-xl w-full h-full object-cover" 
                     src={previewUrl} 
                  />
               )}
                  {/* {previewUrl && <img src={previewUrl} className="rounded-xl w-full h-full object-contain" />} */}
               </div>
               <AlertDialogFooter>
                  <AlertDialogAction variant={"outline"} className="text-md" onClick={() => uploadImage()}>
                     {loading ? <Loader2 className="animate-spin" /> : t("m1")}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   )
}
