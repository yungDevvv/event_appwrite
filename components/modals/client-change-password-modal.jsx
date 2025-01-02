"use client";

import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
   DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useState } from 'react';
import { useModal } from '@/hooks/use-modal';
import { useRouter } from 'next/navigation';
// 
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { updatePassword } from '@/lib/appwrite/server/appwrite';
import { Separator } from '../ui/separator';

const ClientChangePasswordModal = () => {
   const [password, setPassword] = useState("");
   const [oldPassword, setOldPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [errorMessage, setErrorMessage] = useState("");

   const { toast } = useToast();
   const { isOpen, onClose, type } = useModal();

   const isModalOpen = isOpen && type === "change-password";

   const router = useRouter();

   const changePassword = async () => {
      if (oldPassword === "") {
         setErrorMessage("Vanha salasana on pakollinen")
         return;
      }
      if (password === "") {
         setErrorMessage("Salasana on pakollinen")
         return;
      }
      if (confirmPassword === "") {
         setErrorMessage("Salasanan vahvistus on pakollinen");
         return;
      }
      if (password !== confirmPassword) {
         setErrorMessage("Salasanojen täytyy olla samanlaiset!");
         return;
      }
      try {
         await updatePassword(password, oldPassword);

         toast({
            variant: "success",
            title: "Salasana",
            description: "Salasana on nyt vaihdettu!"
         });
         router.push("/dashboard/events")
         router.refresh()
         onClose();

      } catch (e) {
         console.log(e);
         if(e.message === "Invalid credentials. Please check the email and password.") {
            setErrorMessage("Tarkista vanha salasana");
            return;
         }
         toast({
            variant: "supabaseError",
            description: "Tuntematon virhe vaihtaessa salasana."
         });
         return;
      }
   }
   return (
      <Dialog open={isModalOpen} onOpenChange={onClose}>
         <DialogContent className='bg-white text-black p-6 w-full !max-w-md'>
            <DialogHeader>
               <DialogTitle className='text-2xl text-center font-bold'>
                  Vaihda salasana
               </DialogTitle>
            </DialogHeader>
            <DialogDescription></DialogDescription>
            <div>
               {errorMessage && <p className='text-red-500 mb-3'>{errorMessage}</p>}
               <Label>Vanha salasana</Label>
               <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            </div>
            <Separator />
            <div>
               <Label>Uusi salasana</Label>
               <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
               <Label>Salasana vahvistus</Label>
               <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button className="bg-clientprimary hover:bg-clientprimary" onClick={() => changePassword()}>Vaihda</Button>
         </DialogContent>
      </Dialog>
   );
}

export default ClientChangePasswordModal;
