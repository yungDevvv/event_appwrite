"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { cn } from "@/lib/utils";
import { Loader2, Search, SquareX, X } from "lucide-react";
import { useRouter } from "next/navigation"
import { Fragment, useEffect, useState } from "react";
import useSWR from "swr";

import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { getDocument, updateDocument } from "@/lib/appwrite/server/appwrite";
import { storage } from "@/lib/appwrite/client/appwrite";

export default function Page() {
   const { event_id } = useParams();

   const [isFullScreen, setIsFullScreen] = useState(false);
   const [fullscreenImage, setFullscreenImage] = useState({});
   let [filter, setFilter] = useState("waiting");

   const toggleFullScreen = (imageUrl, type) => {
      setIsFullScreen(!isFullScreen);
      setFullscreenImage({
         imageUrl,
         type
      })
   };

   const { toast } = useToast();
   const router = useRouter()

   const { data, mutate, isLoading } = useSWR(event_id, async () => {
      const { data, error } = await getDocument("main_db", "events", event_id);

      if (error) {
         console.log(error);
         return;
      }

      const reportedPosts = data.event_posts.map(item => {
         return {
            ...item,
            reports: data.event_posts_reports.filter(post => post.event_posts.$id === item.$id)
         }
      }).filter(post => post.is_reported === true);
      return { event: data, reportedPosts };
   });

   const filteredReportedPosts = (data?.reportedPosts || []).filter(post => {

      if (filter === "all") return true;
      return post.report_status === filter;
   });


   return (
      <div className="w-full h-full">
         <h1 className="font-semibold text-2xl">{data?.event && data.event.event_name}</h1>
         <div className="flex flex-wrap gap-2 mt-5 max-sm:space-x-0 sm:space-x-4">
            <Button className={cn("bg-clientprimary hover:bg-clientprimaryhover opacity-90 max-sm:w-full", filter === "waiting" && "bg-clientprimaryhover opacity-1")} onClick={() => setFilter("waiting")}>Odottaa tarkistusta</Button>
            <Button className={cn("bg-clientprimary hover:bg-clientprimaryhover opacity-90 max-sm:w-full", filter === "deleted" && "bg-clientprimaryhover opacity-1")} onClick={() => setFilter("deleted")}>Poistetut</Button>
            <Button className={cn("bg-clientprimary hover:bg-clientprimaryhover opacity-90 max-sm:w-full", filter === "approved" && "bg-clientprimaryhover opacity-1")} onClick={() => setFilter("approved")}>Hyväksytyt</Button>
            <Button className={cn("bg-clientprimary hover:bg-clientprimaryhover opacity-90 max-sm:w-full", filter === "all" && "bg-clientprimaryhover opacity-1")} onClick={() => setFilter("all")}>Kaikki</Button>
         </div>
         {isFullScreen && (
            <div
               className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
               onClick={toggleFullScreen}
            >
               {fullscreenImage.type === "video" && <video autoPlay muted loop controls className="rounded-xl py-10 w-full h-full object-contain" src={fullscreenImage.imageUrl} />}
               {fullscreenImage.type === "image" && <img className="rounded-xl w-full h-full py-10 object-contain" src={fullscreenImage.imageUrl} />}
            </div>
         )}
         {isLoading
            ? (
               <div className="w-full h-full flex items-center justify-center">
                  <Loader2 size={46} className="text-zinc-700 animate-spin" />
               </div>
            ) : filteredReportedPosts.length !== 0 ? filteredReportedPosts.map((reported_post) => <ReportedPost router={router} toast={toast} mutateParent={mutate} toggleFullScreen={toggleFullScreen} key={reported_post.$id} post={reported_post} />) : <p className="mt-5">Ei ilmoituksia</p>
         }
      </div>
   );
}


const ReportedPost = ({ post, toggleFullScreen, router, toast, mutateParent }) => {
   const [fileType, setFileType] = useState(null)


   const deleteImageFromView = async () => {
      const { error } = await updateDocument("main_db", "event_posts", post.$id, {
         report_status: "deleted",
         is_accepted: false
      })

      if (error) {
         console.log(error);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe poistaessa kuva."
         });
         return;
      }

      toast({
         variant: "success",
         title: "Kuva",
         description: "Kuva on poistettu näkymästä onnistuneesti!"
      });

      router.refresh();
      mutateParent();

   }

   const approveImage = async () => {
      const { error: eventPostError } = await updateDocument("main_db", "event_posts", post.$id, {
         is_accepted: true,
         report_status: "approved"
      })

      if (eventPostError) {
         console.log(eventPostError);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe."
         });
         return;
      }

      toast({
         variant: "success",
         title: "Kuva",
         description: "Kuva on säilytetty!"
      });

      router.refresh();
      mutateParent();
   }

   useEffect(() => {
      const getMimeTypeFromUrl = async (bucked_id, image_url) => {
         try {
            const image = await storage.getFile(bucked_id, image_url);
            const type = image.mimeType.split("/")[0];

            if (type === 'image') {
               setFileType('image');
            } else if (type === 'video') {
               setFileType('video');
            } else {
               setFileType('unknown');
            }
         } catch (error) {
            console.log('Error fetching the URL:', error);
            setFileType('unknown');
         }
      };

      getMimeTypeFromUrl("event_images", post.image_url);
   }, [post]);

   return (
      <Fragment>
         <div className="w-full flex max-sm:flex-col sm:flex-row my-5">
            <div className="max-sm:w-full sm:max-w-[200px] max-h-[200px] my-3 relative">
               <Search size={30} onClick={() => toggleFullScreen(storage.getFileView("event_images", post.image_url), fileType)} className="absolute top-3 right-3 text-clientprimary cursor-pointer z-10" />
               {fileType === "video" && (
                  <video
                     autoPlay
                     muted
                     loop
                     controls
                     className="rounded-xl w-full h-full object-cover"
                     src={storage.getFileView("event_images", post.image_url)}
                  />
               )}
               {fileType === "image" && (
                  <img
                     className="rounded-xl w-full h-full object-cover"
                     src={storage.getFilePreview("event_images", post.image_url)}
                  />
               )}
            </div>

            <div className="max-sm:my-3 sm:my-auto sm:ml-10 flex-grow">
               <div className="mb-5">
                  {post.report_status === "deleted" && <Badge variant="destructive">Piilotettu</Badge>}
                  {post.report_status === "waiting" && <Badge className="bg-blue-500 hover:bg-blue-500">Odottaa tarkistusta</Badge>}
                  {post.report_status === "approved" && <Badge className="bg-green-500 hover:bg-green-500">Hyväksytty</Badge>}
               </div>
               <p className="text-xs text-zinc-700">Kuvan omistaja</p>
               <p className="mt-1 text-sm">{post.users.first_name} {post.users.last_name}</p>
               <h3 className="-mt-1 text-sm">{post.users.email}</h3>

               <Dialog>
                  <DialogTrigger className="text-sm hover:underline cursor-pointer mt-5">Katso raportit</DialogTrigger>
                  <DialogContent className="max-w-[90vw] sm:max-w-lg">
                     <DialogHeader>
                        <DialogTitle>Kaikki kuvan raportit</DialogTitle>
                        <DialogDescription></DialogDescription>
                        <div className="max-h-[60vh] overflow-y-auto">
                           {post && post.reports.length !== 0 && post.reports.map((reason) => {
                              return (
                                 <div key={reason.$createdAt} className='my-2'>
                                    <div className='flex items-center justify-between flex-wrap gap-2'>
                                       <p className='font-semibold'>{reason.users.first_name} {reason.users.last_name}</p>
                                       <p className='text-zinc-400'>{format(new Date(reason.$createdAt), 'HH:mm')}</p>
                                    </div>
                                    <p className="text-red-500 text-sm">{reason.report_reason}</p>
                                 </div>
                              )
                           })}
                        </div>
                     </DialogHeader>
                  </DialogContent>
               </Dialog>
            </div>

            <div className="max-sm:mt-5 sm:my-auto sm:ml-auto flex flex-col gap-2">
               {post.report_status === "deleted" && (
                  <Button className="bg-clientprimary hover:bg-clientprimaryhover max-sm:w-full" onClick={() => approveImage()}>
                     Jatka julkaisua
                  </Button>
               )}
               {post.report_status === "approved" && (
                  <Button className="bg-red-600 hover:bg-red-700 max-sm:w-full" onClick={() => deleteImageFromView()}>
                     Piilota julkaisu
                  </Button>
               )}
               {post.report_status === "waiting" && (
                  <Fragment>
                     <Button className="bg-green-600 hover:bg-green-700 max-sm:w-full" onClick={() => approveImage()}>
                        Jatka julkaisua
                     </Button>
                     <Button className="bg-red-600 hover:bg-red-700 max-sm:w-full" onClick={() => deleteImageFromView()}>
                        Piilota julkaisu
                     </Button>
                  </Fragment>
               )}
            </div>
         </div>
         <hr />
      </Fragment>

   )
}