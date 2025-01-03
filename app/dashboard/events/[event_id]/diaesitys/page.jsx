"use client"

import DiaImage from "@/components/diaesitys-image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getDocument, updateDocument } from "@/lib/appwrite/server/appwrite";

import { Loader2, SquareX } from "lucide-react";
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { Fragment, useEffect, useState } from "react";
import useSWR from "swr";


export default function Page() {
   const searchParams = useSearchParams();
   const { event_id } = useParams();
   
   const { toast } = useToast();

   const router = useRouter()

   const { data: event, mutate, isLoading } = useSWR(event_id, async () => {
  
      const { data, error } = await getDocument("main_db", "events", event_id);
  
      if (error) {
         alert(error);
         console.log(error);
         return;
      }
      
      return data;
   });

   const [selectedPosts, setSelectedPosts] = useState({});

   const handleCheckboxChange = (postId) => {
      setSelectedPosts((prev) => ({
         ...prev,
         [postId]: !prev[postId],
      }));
   };

   const handleSave = async () => {
      console.log(selectedPosts)
      const updates = Object.entries(selectedPosts).map(async ([postId, show]) => {

         const { error } = await updateDocument("main_db", "event_posts", postId, {
            show_in_slider: !show
         })

         if (error) {
            alert(error);
            return;
         }
      });

      await Promise.all(updates);

      const { error } = await updateDocument("main_db", "events", event_id, {
         "diaesitys": true
      });

      if (error) {
         console.log(error)
         alert(error);
         return;
      }

      router.push(`/dashboard/events/${event_id}/diaesitys/slider`);
   };

   useEffect(() => {
      if (event) {
         const canceledPosts = event?.event_posts?.reduce((acc, post) => {
            if (post.show_in_slider === false) {
               acc[post.$id] = true;
            }
            return acc;
         }, {});
         
         setSelectedPosts(canceledPosts)
      }
      mutate();
   }, [event])

   useEffect(() => {
      if (searchParams["offline"]) { //if redirected from /diaesitys/slider
         (async () => { // turn off slide show
            const { error } = await updateDocument("main_db", "events", event_id, {
               "diaesitys": false
            });

            if (error) {
               console.log(error);
               toast({
                  variant: "supabaseError",
                  description: "Tuntematon virhe sammutettaessa diaesitystä."
               });
               return;
            }

            toast({
               variant: "success",
               title: "Diaesitys",
               description: "Diaesitys on nyt pysäytetty."
            });
         })()
      }

   }, [])

   return (
      <div className="w-full h-full min-h-screen">
         <h1 className="font-semibold text-2xl">{event && event.event_name}</h1>
         <p className="text-base mt-1 mb-3 text-zinc-600">Jätä vain ne kuvat, jotka haluat näyttää diaesityksessa</p>
         {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
               <Loader2 size={46} className="text-zinc-700 animate-spin" />
            </div>
         ) : (
            <Fragment>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {event && event.event_posts && event.event_posts.length !== 0
                     ? event.event_posts.map(post => <DiaImage key={post.$id} post={post} selectedPosts={selectedPosts} handleCheckboxChange={handleCheckboxChange} />)
                     : "Ei ole kuvia vielä."
                  }
               </div>
               {event && event.event_posts && event.event_posts.length !== 0 && <Button className="mt-4 bg-clientprimary hover:bg-clientprimaryhover" onClick={() => handleSave()}>Talenna ja aloita diaesitys</Button>}
            </Fragment>
         )}

      </div>
   );
}


