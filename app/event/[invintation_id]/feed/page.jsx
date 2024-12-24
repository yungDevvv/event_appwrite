"use client"

import '../../../custom.css'
import UploadImage from "@/components/forms/upload-image";
import { PostList } from "@/components/post-list";
import { useEventContext } from "@/context/EventContext";
import { useInfinitePosts } from "@/hooks/use-infinity-posts"
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button";
import { useTabs } from "@/hooks/use-tabs";
import { MoveLeft, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl';
import { updateDocument } from '@/lib/appwrite/server/appwrite';



export default function Page() {
   const { eventData, userData } = useEventContext();
   console.log(eventData);
   const t = useTranslations();

   const router = useRouter();
   const { tab, setTab } = useTabs();
   // const { posts, isLoading, setSize, isReachingEnd, isValidating, mutate } = useInfinitePosts(2, eventData.id);

   const [favoritesList, setFavoritesList] = useState(userData?.favorite_images ? userData?.favorite_images : []);
   const [isAnimating, setIsAnimating] = useState(false);

   useEffect(() => {
      localStorage.setItem("event-app-image-fav", JSON.stringify(favoritesList));

      (async () => {
         if (favoritesList.length !== 0) {
            const { error } = await updateDocument("main_db", "users", userData.$id, {
               favorite_images: favoritesList
            })

            if (error) return;
         }
      })()

   }, [favoritesList]);

   const addToFavorites = (post) => {
      if (favoritesList.includes(post.$id)) {
         setFavoritesList(favoritesList.filter(id => id !== post.$id));
         (async () => {
            if (favoritesList.length !== 0) {

               const { error } = await updateDocument("main_db", "users", userData.$id, {
                  favorite_images: favoritesList.filter(id => id !== post.$id)
               })

               if (error) return;
            }
         })()
      } else {
         setFavoritesList([post.$id, ...favoritesList]);
         (async () => {
            if (favoritesList.length !== 0) {

               const { error } = await updateDocument("main_db", "users", userData.$id, {
                  favorite_images: [post.$id, ...favoritesList]
               })
               if (error) return;
            }
         })()

      }
   };

   // useEffect(() => {
   //    const handleScroll = () => {
   //       if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !isReachingEnd && !isValidating) {
   //          setSize((prevSize) => prevSize + 1);
   //       }
   //    };

   //    window.addEventListener('scroll', handleScroll);

   //    return () => window.removeEventListener('scroll', handleScroll);
   // }, [isReachingEnd, isValidating, setSize]);

   const filteredList = eventData?.event_posts?.filter(post => {
      if (tab === "favorites") return favoritesList.includes(post.$id);
      if (tab === "my") return post.users.$id === userData.$id;
      return true; // all posts
   })
   .sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

   if (!eventData) return "Event ID is missing!";

   return (
      <div className="bg-black min-h-screen relative">
         <div className="pb-[60px] px-4 max-xs:px-2">
            <div className="fixed top-0 left-0  w-full px-2 max-mobile:px-0">
               <div className='relative w-full flex items-center py-5 max-mobile:flex-wrap max-w-[100%] max-xs:pr-2 px-2'>
                  <div className="absolute inset-0 backdrop-blur-md bg-black/80 w-full" />
                  <Button variant="icon" className="relative z-10 max-mobile:w-full max-mobile:mb-3 text-lg flex items-center max-md:border border-black bg-clientprimary px-4 h-[37px]" onClick={() => router.push("/event/" + eventData.invintation_id)}>
                     <MoveLeft className="text-white" />
                  </Button>
                  {/* <div className="mx-2 max-md:w-full max-md:block">
                  <Separator className="rotate-90 w-6 text-clientprimary border-clientprimary bg-clientprimary" />
               </div> */}
                  <div className='ml-auto max-mobile:ml-0  flex items-center max-mobile:justify-between max-mobile:w-full relative z-10'>
                     <Button
                        className={`bg-clientprimary flex-1 max-mobile:w-full hover:bg-clientprimaryhover text-white mr-5 max-md:mr-3 font-medium`}
                        onClick={() => {
                           router.refresh();
                           setIsAnimating(true);
                        }}
                        onAnimationEnd={() => setIsAnimating(false)}
                     >
                        <RefreshCcw className={isAnimating ? 'animate-spinOnce' : ''} />
                     </Button>
                     <Button className={cn("bg-clientprimary max-mobile:w-full hover:bg-clientprimaryhover text-white mr-5 max-md:mr-3 opacity-40 font-medium", tab === "" && "opacity-1")} onClick={() => setTab("")}>
                        {t("w2")}
                     </Button>
                     <Button className={cn("bg-clientprimary max-mobile:w-full hover:bg-clientprimaryhover text-white mr-5 max-md:mr-3 opacity-40 font-medium", tab === "my" && 'opacity-1')} onClick={() => setTab("my")}>
                        {t("w3")}
                     </Button>
                     <Button className={cn("bg-clientprimary max-mobile:w-full hover:bg-clientprimaryhover text-white opacity-40 font-medium", tab === "favorites" && 'opacity-1')} onClick={() => setTab("favorites")}>
                        {t("w4")}
                     </Button>
                  </div>
               </div>

            </div>

            {/* {isLoading
               ? (
                  <>
                     <div className="mt-2 bg-white p-4 py-10">
                        <Skeleton className="w-[30%] h-[20px] rounded-lg" />
                        <Skeleton className="w-[10%] h-[20px] my-2 rounded-lg" />
                        <Skeleton className="w-full max-w-[360px] mx-auto h-[450px] rounded-lg" />
                     </div>
                     <div className="mt-4 bg-white p-4 py-10">
                        <Skeleton className="w-[30%] h-[20px] rounded-lg" />
                        <Skeleton className="w-[10%] h-[20px] my-2 rounded-lg" />
                        <Skeleton className="w-full max-w-[360px] mx-auto h-[450px] rounded-lg" />
                     </div>
                  </>
               ) : <PostList
                  posts={filteredList}
                  favoritesList={favoritesList}
                  user={userData}
                  isLoading={isLoading}
                  isValidating={isValidating}
                  addToFavorites={addToFavorites}
                  mutate={mutate}
               />
            } */}
            <PostList
               posts={filteredList}
               favoritesList={favoritesList}
               user={userData}
               addToFavorites={addToFavorites}
            />
         </div>
         <div className="fixed bottom-0 right-1/2 -translate-x-1/2 -mr-[88px]">
            {/* {tab === "" && <UploadImage mutate={mutate} user_id={userData.id} event_id={eventData.id} />} */}
            {tab === "" && <UploadImage user_id={userData.$id} event_id={eventData.$id} />}
         </div>
      </div>
   );
}

