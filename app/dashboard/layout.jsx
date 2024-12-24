import { MainSidebar } from "@/components/sidebar/main-sidebar"
import { Toaster } from "@/components/ui/toaster"
import {
  SidebarLayout,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ModalProvider } from "@/components/providers/modal-provider";
import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/lib/appwrite/server/appwrite";

export default async function DashboardLayout({ children }) {
  const user = await getLoggedInUser();

  // const { data: clientData, error } = await supabase
  //   .from("client_data")
  //   .select("logo")
  //   .eq("user_id", user.id);
  

  if(user?.role === "member") {
    return redirect("/");
  }

  return (
    <SidebarLayout defaultOpen={true}>
      {/* <MainSidebar user={user} clientData={clientData.length !== 0 ? clientData[0] : null} /> */}
      <MainSidebar user={user} />
      <main
        className="flex flex-1 flex-col p-6 max-lg:p-2 transition-all duration-300 ease-in-out overflow-x-hidden">
        <div className="h-full w-full">
          <SidebarTrigger />
          {children}
        </div>
      </main>
      <Toaster />
      <ModalProvider />
    </SidebarLayout>
  );
}