"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { Fragment, useState } from "react";

import {  listDocuments, signInWithEmail } from "@/lib/appwrite/server/appwrite";
import { storage } from "@/lib/appwrite/client/appwrite";
import SVGComponent from "../svg-image";
import { mauticEmailService } from "@/lib/mautic/mautic";

export default function RegisterForEventForm({ logo, title, invintation_id }) {

   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
   const [message, setMessage] = useState("");
   const [errorMessage, setErrorMessage] = useState("");
   const [activeRegisterForm, setActiveRegisterForm] = useState(true);


   const handleRegister = async (formData) => {
      setMessage("");
      setErrorMessage("");

      const { error, data } = await signInWithEmail(formData.email, { register: true, first_name: formData.first_name, last_name: formData.last_name, invintation_id: invintation_id, email: formData.email });

      setMessage("Kirjautumislinkki lähetettiin sähköpostiisi. Kyseessä on kertakäyttöinen linkki, joka toimii vain kirjautumista varten.");

      if (error) {
         console.log(error);
         setErrorMessage(error?.message);
         return;
      }
      
      await mauticEmailService.handleUserAuthentication(formData.email, { name: `${formData.first_name} ${formData.last_name}` });

   }

   const handleLogin = async (formData) => {
      setMessage("");
      setErrorMessage("");

      const userExists = await listDocuments("main_db", "users", [{ type: "equal", name: "email", value: formData.email }, { type: "limit", value: 1 }])

      if (userExists.total === 0) {
         setMessage("Ole hyvä ja rekiströidy ensin!");
         setActiveRegisterForm(true);
         return;
      }



      const { error, data } = await signInWithEmail(formData.email, { register: false, invintation_id: invintation_id });

      if (data) {

         setMessage("Kirjautumislinkki lähetettiin sähköpostiisi. Kyseessä on kertakäyttöinen linkki, joka toimii vain kirjautumista varten.");
      }
   };


   return (
      <Card className="mx-auto w-full max-w-md relative">
         {logo && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
               <SVGComponent
                  className="w-40 text-center"
                  url={storage.getFileView("logos", logo)}
               />
            </div>
         )}
         <CardHeader>
            <CardTitle className="text-xl text-center">
               {activeRegisterForm ? "Rekiströidy tapahtumaan " : "Kirjaudu sisään tapahtumaan "} <br></br> <span className="font-medium text-orange-400">{title}</span>
            </CardTitle>
            {message && <p className="text-green-500 text-sm">{message}</p>}
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
         </CardHeader>
         <CardContent>
            <form onSubmit={activeRegisterForm ? handleSubmit(handleRegister) : handleSubmit(handleLogin)} className="grid gap-4">
               {activeRegisterForm && (
                  <Fragment>
                     <div className="grid gap-2">
                        <Label htmlFor="first_name">Etunimi</Label>
                        <Input
                           id="first_name"
                           type="text"
                           {...register("first_name", { required: "Etunimi on pakollinen" })}
                        />
                        {errors.first_name && <p className="text-red-500 text-sm -mt-1">{errors.first_name.message}</p>}
                     </div>
                     <div className="grid gap-2">
                        <Label htmlFor="last_name">Sukunimi</Label>
                        <Input
                           id="last_name"
                           type="text"
                           {...register("last_name", { required: "Sukunimi on pakollinen" })}
                        />
                        {errors.last_name && <p className="text-red-500 text-sm -mt-1">{errors.last_name.message}</p>}
                     </div>
                  </Fragment>
               )}
               <div className="grid gap-2">
                  <Label htmlFor="email">Sähköposti</Label>
                  <Input
                     id="email"
                     type="email"
                     placeholder="m@example.com"
                     {...register("email", { required: "Sähköposti on pakollinen" })}
                  />
                  {errors.email && <p className="text-red-500 text-sm -mt-1">{errors.email.message}</p>}
               </div>
               {activeRegisterForm
                  ? (
                     <Fragment>
                        <Button
                           type="submit"
                           className="w-full text-md bg-orange-400 hover:bg-orange-500 cursor-pointer"
                           disabled={isSubmitting}
                        >
                           {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Rekiströidy"}
                        </Button>
                        <Separator />
                     </Fragment>
                  ) : (
                     <Fragment>
                        <Button
                           type="submit"
                           className="w-full text-md bg-orange-400 hover:bg-orange-500 cursor-pointer !text-white"
                           disabled={isSubmitting}
                        >
                           {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Kirjaudu"}
                        </Button>
                        <Separator />
                     </Fragment>
                  )}
            </form>
            <div className="mt-4 text-center text-sm">
               {activeRegisterForm
                  ? (
                     <Button variant={"link"} onClick={() => setActiveRegisterForm(false)} className="font-normal hover:underline text-base">
                        Kirjaudu sisään
                     </Button>
                  )
                  : (
                     <Button variant={"link"} onClick={() => setActiveRegisterForm(true)} className="font-normal hover:underline text-base">
                        Rekiströidy
                     </Button>
                  )}
            </div>
         </CardContent>
      </Card>
   );
}
