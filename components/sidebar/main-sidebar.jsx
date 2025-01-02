"use client"

import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

import ClientSidebarContent from "./roles/client-sidebar-content"
import AdminSidebarContent from "./roles/admin-sidebar-content"
import { storage } from "@/lib/appwrite/client/appwrite"
import SVGComponent from "../svg-image"

export function MainSidebar({ user }) {
  return (
    <Sidebar className="bg-accent/60 ">
      <SidebarHeader className="justify-center">
        {user?.clientData && user.clientData?.logo
          ? <SVGComponent
            className="max-h-[100px] min-h-[50px] h-full"
            url={storage.getFileView("logos", user.clientData.logo)}
          />
          : <span className="text-lg text-orange-500 font-bold">Company Logo</span>
        }
      </SidebarHeader>

      {user.role === "client" && <ClientSidebarContent user={user} />}
      {user.role === "superadmin" && <AdminSidebarContent />}
      {user.role === "member" && <p className="text-semibold text-lg py-3 text-center">You are member!</p>}
      {/* <ClientSidebarContent /> */}
      <SidebarFooter className="bg-white">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
