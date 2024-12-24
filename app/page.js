import { redirect } from 'next/navigation'
import { Error } from '@/components/ui/error';
import { getLoggedInUser } from '@/lib/appwrite/server/appwrite';


export default async function Home() {
  const user = await getLoggedInUser();
  

  if (user.role === "client") {
    return redirect("/dashboard/events");
  }

  if (user.active_event) {

    /* DOES EVENT EXISTS */
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("invintation_id", user.active_event);

    if (eventError) {
      console.log(eventError);
      return <Error text="500 Internal Server Error" />;
    }
   
    if (event.length === 0) {
      return <Error text="Tapahtuma ei löydy!" />;
    }

    /* IS ALREADY MEMBER */
    const { error: memberError, data: member } = await supabase
      .from("event_member")
      .select("id")
      .eq("event_id", event[0].id)
      .eq("user_id", user.id);

    if (memberError) {
      console.log(memberError);
      return <Error text="500 Internal Server Error" />;
    }
    console.log(member, "IS MEMBER IN EVENT ALREADY")
    /* ADD MEMBER + REDIRECT */
    if (member.length === 0) {

      console.log("MEMBER ADDING")
      const { error: addMemberError } = await supabase
        .from('event_member')
        .insert([
          { user_id: user.id, event_id: event[0].id }
        ]);

      if (addMemberError) {
        console.log(addMemberError)
        return <Error text="500 Internal Server Error" />;
      }
    }

    return redirect(`/event/${user.active_event}`)

  } else {
    return <div>Case that should be handled!</div>
  }
}

