import FullscreenCarousel from "@/components/page-components/fullscreen-carousel";
import { getLoggedInUser } from "@/lib/appwrite/server/appwrite";

export default async function Page({ params }) {
   const user = await getLoggedInUser();
   const { event_id } = await params;

   const event = user.events.find((event) => event.$id === event_id);
   
   const carouselData = event.event_posts.filter((post) => post.show_in_slider === true);

   if(!event) {
      return ( 
         <div className="w-full h-full fixed flex items-center justify-center top-0 bottom-0 right-0 left-0 z-50 bg-black">
            <h1 className="text-white text-2xl">Tapahtuma ei ole olemassa</h1>
         </div>
      );
   }
   if (event.diaesitys === false) {
      return (
         <div className="w-full h-full fixed flex items-center justify-center top-0 bottom-0 right-0 left-0 z-50 bg-black">
            <h1 className="text-white text-2xl">Diaesitys on pysähdetty</h1>
         </div>
      );
   }

   return (
      <div className="w-full h-full fixed top-0 bottom-0 right-0 left-0 z-50 bg-black">
         <FullscreenCarousel event_id={event.$id} data={carouselData} />
      </div>
   );
}


