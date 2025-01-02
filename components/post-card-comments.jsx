"use client";
import {
   Drawer,
   DrawerClose,
   DrawerContent,
   DrawerDescription,
   DrawerFooter,
   DrawerHeader,
   DrawerTitle,
   DrawerTrigger,
} from "@/components/ui/drawer"
import { MessageSquare, SendHorizonal, X } from "lucide-react"
import { Input } from "./ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"

import { format } from 'date-fns';
import { createDocument } from '@/lib/appwrite/server/appwrite';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';



export default function PostCardComments({ user, post }) {
   const [text, setText] = useState("");
   const { toast } = useToast();

   const router = useRouter();

   const sendComment = async () => {
      if (!text.trim()) return;

      const { error } = await createDocument("main_db", "event_posts_comments", {
         body: {
            users: user.$id,
            event_posts: post.$id,
            first_name: user.first_name,
            last_name: user.last_name,
            comment_text: text
         }
      })

      if (error) {
         console.log(error)
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe."
         })
         router.refresh();
         return;
      }

      router.refresh();
      setText("");
   }
  
   return (
      <div className='text-black'>
         <Drawer>
            <DrawerTrigger className="bg-clientprimary rounded-full flex items-center px-4 py-2 mr-3 max-sm:text-sm">
               <MessageSquare className='max-sm:w-[22px] text-white' />
               <span className="text-lg ml-2 font-semibold -mt-1 max-sm:text-base max-sm:ml-1 text-white">{post?.event_posts_comments && post.event_posts_comments.length}</span>
            </DrawerTrigger>
            <DrawerContent>
               <DrawerHeader>
                  <DrawerTitle className="text-black text-center">Kommentit</DrawerTitle>
                  <DrawerDescription></DrawerDescription>
               </DrawerHeader>
               <ScrollArea className="min-h-[250px] max-h-[450px] border-t border-b p-4 overflow-y-scroll text-black">
                  {post && post.event_posts_comments.length !== 0
                     ? post.event_posts_comments.map(comment =>
                        <div key={comment.$id} className='my-2'>
                           <div className='flex items-center justify-between text-sm'>
                              <p className='font-semibold'>{comment.first_name} {comment.last_name}</p>
                              <p className='text-zinc-400'>{format(new Date(comment.$createdAt), 'HH:mm')}</p>
                           </div>
                           <p>
                              {comment.comment_text}
                           </p>
                        </div>)
                     : "Ei ole vielä kommenteja..."
                  }

               </ScrollArea>
               <DrawerFooter>
                  <div className="flex items-center border border-zinc-200 w-full rounded-lg transition-all">
                     <Input value={text} onChange={(e) => setText(e.target.value)} required className="w-full my-1 border-0 text-lg text-black" type="text" placeholder="Kirjoita kommentti..." />
                     {text && (
                        <Button variant="icon" className="p-0 px-2 border-0 border-zinc-200" onClick={() => sendComment()}>
                           <SendHorizonal className='text-black' />
                        </Button>
                     )}
                  </div>
               </DrawerFooter>
            </DrawerContent>
         </Drawer>
      </div>

   )
}