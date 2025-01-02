const getMimeTypeFromUrl = async (image_url) => {
   try {
      const image = await storage.getFile("event_images", image_url);
      const type = image.mimeType.split("/")[0];

      if (type === 'image') {
         return 'image';
      } else if (type === 'video') {
         return 'video';
      } else {
         return 'unknown';
      }
   } catch (error) {
      console.log('Error fetching the URL:', error);
      return 'unknown';
   }
};

export default async function Page({ searchParams }) {
   if (!searchParams && !searchParams["image_url"]) {
      return (
         <div>Kuvan URL puuttuu!</div>
      )
   }
   const mime_type = await getMimeTypeFromUrl(searchParams["image_url"]);
   return (
      <div className="h-full min-h-screen flex justify-center items-center bg-gray-200">
         {/* <Head>
            <meta property="og:title" content="How to Become an SEO Expert (8 Steps)" />
            <meta property="og:description" content="Get from SEO newbie to SEO pro in 8 simple steps." />
            <meta property="og:image" content={searchParams["image_url"]} />
         </Head> */}
         {mime_type === "image" && <img className="" src={searchParams["image_url"]} />}
         {mime_type === "video" && <video autoPlay muted loop controls src={searchParams["image_url"]} />}
      </div>
   );
}


