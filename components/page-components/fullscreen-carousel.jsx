"use client";

import {
   Carousel,
   CarouselContent,
   CarouselItem,
   CarouselNext,
   CarouselPrevious,
} from "@/components/ui/carousel";

import useSWR from "swr";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/appwrite/client/appwrite";



const FullscreenCarousel = ({ data, event_id }) => {

   const router = useRouter();

   useEffect(() => {
      const handleKeyDown = (event) => {
         if (event.key === 'Escape') {
            router.push(`/dashboard/events/${event_id}/diaesitys?offline=true`);
         }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
         window.removeEventListener('keydown', handleKeyDown);
         router.refresh();
      };
   }, [router, event_id]);

   const [currentIndex, setCurrentIndex] = useState(0);
   const intervalRef = useRef(null);

   // Advance the slide every 7 seconds
   useEffect(() => {
      if (data) {
         intervalRef.current = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
         }, 7000);
      }
      return () => clearInterval(intervalRef.current);
   }, [data]);

   const toggleFullscreen = async () => {
      try {
         if (document.fullscreenElement) {
            await document.exitFullscreen();
         } else {
            await document.documentElement.requestFullscreen();
         }
      } catch (err) {
         console.log(err);
         alert("Virhe: Fullscreen-tilan vaihtaminen epäonnistui.")
      }
   };

   useEffect(() => {

      document.body.addEventListener("click", toggleFullscreen);

      return () => {
         document.body.removeEventListener("click", toggleFullscreen);
      };
   }, []);

   return (
      <div className="w-full h-screen bg-black">
         <Carousel loop={true} className="w-full h-full">
            <CarouselContent className="h-screen">
               {data && data.map((post, index) => (
                  <CarouselItem
                     key={index}
                     className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                  >
                     <ContentFetcher imageUrl={post.image_url} />
                     {/* <img
                        src={`https://supa.crossmedia.fi/storage/v1/object/public/${post.image_url}`}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-contain object-center"
                     /> */}
                  </CarouselItem>
               ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
         </Carousel>
      </div>
   );
};

const ContentFetcher = ({ imageUrl }) => {
   const [fileType, setFileType] = useState('unknown');

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

      getMimeTypeFromUrl("event_images", imageUrl);
   }, [imageUrl]);

   // useEffect(() => {
   //    const getMimeTypeFromUrl = async (url) => {
   //       try {
   //          const response = await fetch(url, { method: 'HEAD' });
   //          const contentType = response.headers.get('Content-Type');

   //          if (contentType.includes('image')) {
   //             setFileType('image');
   //          } else if (contentType.includes('video')) {
   //             setFileType('video');
   //          } else {
   //             setFileType('unknown');
   //          }
   //       } catch (error) {
   //          console.log('Error fetching the URL:', error);
   //          setFileType('unknown');
   //       }
   //    };

   //    getMimeTypeFromUrl("https://supa.crossmedia.fi/storage/v1/object/public/" + imageUrl);
   // }, [imageUrl]);

   return (
      <>
         {fileType === 'image' ? (
            // {fileType === "image" && <img src={storage.getFilePreview("event_images", post.image_url)} alt="Post image" className="w-full h-full object-cover" />}
            // {fileType === "video" && <video autoPlay muted loop controls className="rounded-xl w-full h-full object-contain" src={storage.getFileView("event_images", post.image_url)} />}
            <img className="w-full h-full object-contain object-center" src={storage.getFilePreview("event_images", imageUrl)} />
         ) : fileType === 'video' ? (
            <video autoPlay muted loop className="w-full h-full object-contain object-center" src={storage.getFileView("event_images", imageUrl)} />
         ) : (
            <div>Loading content type...</div>
         )}
      </>
   );
};

export default FullscreenCarousel;
