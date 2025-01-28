"use client";

import {
   CommandDialog,
   CommandEmpty,
   CommandInput,
   CommandItem,
   CommandList,
} from "@/components/ui/command"

import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useModal } from "@/hooks/use-modal";
import { useToast } from "@/hooks/use-toast";
import { deleteDocument } from "@/lib/appwrite/server/appwrite";
// 
import { EllipsisVertical, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MembersListModal = () => {
   const { isOpen, onClose, type, data } = useModal();

   const router = useRouter();
   const { toast } = useToast();

   let eventMembers = data.event.data.event_member;

   const isModalOpen = isOpen && type === "event-members-list";

   // const [eventMembers, setEventMembers] = useState([]);
   const [openDropdownId, setOpenDropdownId] = useState(null);

   const kickMember = async (member_id) => {
      const { error } = await deleteDocument("main_db", "event_member", member_id);

      if (error) {
         console.log(error);
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe poistettaessa osallistujaa."
         });
         return;
      }
      eventMembers = eventMembers?.filter((member) => member.$id !== member_id);
      router.refresh();
      toast({
         variant: "success",
         title: "Osallistuja",
         description: "Osallistuja poistettu onnistuneesti!"
      })

   }

   return (
      <CommandDialog open={isModalOpen} onOpenChange={onClose} className="p-3">
         <CommandInput placeholder="Etsi osallistujat..." />
         <CommandList>
            <CommandEmpty>
               Ei osallistuja
            </CommandEmpty>
            {eventMembers.map((member) => (
               <CommandItem
                  key={member.$id}
                  className="cursor-pointer flex justify-between group"
               // onSelect={() => clickHandler({ id, type: "user" })}
               >
                  
                  <div className="flex items-center">
                     <span>{`${member.users.first_name} ${member.users.last_name}`}</span>
                     {member.users.$id === data.event.data.users.$id && <ShieldCheck size={18} className="text-red-500 ml-1" />}
                  </div>
                  {/* <div className="group relative w-40 h-10 flex items-center justify-center border bg-gray-100">
                     <span className="group-hover:hidden">Текст</span>
                     <span className="hidden group-hover:inline">...</span>
                  </div> */}
                  <div className="flex items-center">
                     <span className="mr-2 text-sm text-gray-500">{member.users.email}</span>
                     {member.users.$id !== data.event.data.users.$id && (
                        <DropdownMenu open={openDropdownId === member.users.$id} onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? member.users.$id : null)}>
                           <DropdownMenuTrigger className="hover:bg-zinc-200 p-1 rounded-md">
                              <EllipsisVertical size={20} />
                           </DropdownMenuTrigger>
                           <DropdownMenuContent side={"left"}>

                              <DropdownMenuItem className="flex items-center" onClick={() => kickMember(member.$id)}>
                                 <span>Poista osallistuja</span>
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem className="flex items-center">
                                 <span>Lähetä kutsulinkki</span>
                              </DropdownMenuItem> */}

                           </DropdownMenuContent>
                        </DropdownMenu>
                     )}
                  </div>
               </CommandItem>
            ))}
         </CommandList>
      </CommandDialog>
   )
}

export default MembersListModal;