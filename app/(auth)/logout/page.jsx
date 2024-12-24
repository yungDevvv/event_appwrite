import { redirect } from "next/navigation";

export default async function Page({searchParams}) {
  
   const event_invite_id = searchParams.event_invite_id;

   ;
   const { error } = await supabase.auth.signOut();
   
   if (error) {
      console.log(error)
      return (
         <div className="text-red-500 text-lg">
            Tapahtui virhe yrittäessä kirjautua ulos.
         </div>
      )
   }
   
   if(!event_invite_id) {
      return redirect("/login");
   }

   return redirect("/register-for-event/" + event_invite_id + "?login=true");
}

