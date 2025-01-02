"use client";

import { Fragment, useState } from 'react';
import { Button } from '../../ui/button';

import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';
import { Eye, X } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { createDocument, createFile, updateDocument } from '@/lib/appwrite/server/appwrite';
import { storage } from '@/lib/appwrite/client/appwrite';

const SettingsPrivacyForm = ({ recordExists, user, privacy }) => {
   const [pdfUrl, setPdfUrl] = useState(null);
   const [rawSelectedFile, setRawSelectedFile] = useState(null);
   const [selectedOption, setSelectedOption] = useState(privacy !== null ? privacy.active_privacy : "link");
   const [inputValue, setInputValue] = useState(privacy?.link_privacy ? privacy.link_privacy : "");

   const { toast } = useToast();

   ;
   const router = useRouter();

   const handleFileChanges = (event) => {
      const file = event.target.files[0];

      if (file) {
         setRawSelectedFile(file);
         const url = URL.createObjectURL(file);
         setPdfUrl(url);
      }
   };

   const handleSubmitPDF = async () => {

      if (privacy !== null && selectedOption === "pdf" && privacy.pdf_privacy && !pdfUrl) {
         const { error } = await updateDocument("main_db", "client_data", user.clientData.$id, {
            privacy: JSON.stringify({
               active_privacy: selectedOption,
               pdf_privacy: privacy?.pdf_privacy ? privacy.pdf_privacy : '',
               link_privacy: privacy?.link_privacy ? privacy.link_privacy : ''
            })
         })

         if (error) {
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tietosuojaselosten latauksessa tietokantaan.",
            });
            return;
         }

         toast({
            variant: "success",
            title: "Tietosuojaseloste",
            description: "Nyt käytät PDF-muotoisen tietosuojaselosten."
         });

         router.refresh();
         setRawSelectedFile(null);
         return;
      }

      if (!rawSelectedFile) {
         alert("Tidosto puuttuu! Valitse tietosuojaseloste tiedosto.")
         return;
      }

      let fileId = null;

      if (rawSelectedFile) {
         fileId = await createFile("privacy_statement", rawSelectedFile);
      }


      if (recordExists === false) { // no record in db

         const { error } = await createDocument("main_db", "client_data", {
            body: {
               users: user.$id,
               privacy: JSON.stringify({
                  active_privacy: selectedOption,
                  pdf_privacy: fileId,
                  link_privacy: inputValue
               })
            }
         });

         if (error) {
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe pdf:n latauksessa tietokantaan.",
            });
            return;
         }

         toast({
            variant: "success",
            title: "Tietosuojaseloste",
            description: "Tietosuojaseloste on päivitetty onnistuneesti."
         });
      } else { // record exists
         const { error } = await updateDocument("main_db", "client_data", user.clientData.$id, {
            privacy: JSON.stringify({
               active_privacy: selectedOption,
               pdf_privacy: fileId,
               link_privacy: privacy?.link_privacy ? privacy.link_privacy : ''
            })
         })

         if (error) {
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tietosuojaselosten latauksessa tietokantaan.",
            });
            return;
         }

         toast({
            variant: "success",
            title: "Tietosuojaseloste",
            description: "Tietosuojaseloste on päivitetty onnistuneesti."
         });
      }

      router.refresh();
      setRawSelectedFile(null);
      setPdfUrl(null);
   }

   const handleSubmitLink = async () => {

      if (privacy !== null && selectedOption === "link" && privacy.link_privacy === inputValue) {
         const { error } = await updateDocument("main_db", "client_data", user.clientData.$id, {
            privacy: JSON.stringify({
               active_privacy: selectedOption,
               pdf_privacy: privacy?.pdf_privacy ? privacy.pdf_privacy : '',
               link_privacy: privacy?.link_privacy ? privacy.link_privacy : ''
            })
         })

         if (error) {
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tietosuojaselosten latauksessa tietokantaan.",
            });
            return;
         }

         toast({
            variant: "success",
            title: "Tietosuojaseloste",
            description: "Nyt käytät LINKKI-muotoisen tietosuojaselosten."
         });

         router.refresh();
         return;
      }

      if (recordExists === false) {
         const { error } = await createDocument("main_db", "client_data", {
            body: {
               users: user.$id,
               privacy: JSON.stringify({
                  active_privacy: selectedOption,
                  link_privacy: inputValue,
                  pdf_privacy: privacy?.pdf_privacy ? privacy?.pdf_privacy : ''
               })
            }
         });

         if (error) {
            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tietosuojaselosten tallentamisessa."
            })
            return;
         }

         toast({
            variant: "success",
            title: "Tietosuojaseloste",
            description: "Tietosuojaselosten tallentaminen onnistui."
         })
      } else {
         const { error } = await updateDocument("main_db", "client_data", user.clientData.$id, {
            privacy: JSON.stringify({
               active_privacy: selectedOption,
               link_privacy: inputValue,
               pdf_privacy: privacy?.pdf_privacy ? privacy?.pdf_privacy : ''
            })
         })

         if (error) {

            toast({
               variant: "supabaseError",
               description: "Tuntematon virhe tietosuojaselosten päivittämisessa."
            })
            return;
         }

         toast({
            variant: "success",
            title: "Tietosuojaseloste",
            description: "Tietosuojaselosten päivittäminen onnistui."
         })
      }

      router.refresh();
   }
   return (
      <div className='w-full'>
         <div className='w-full'>
            <h1 className='font-semibold'>Tietosuojaseloste</h1>
            <p className='text-zinc-600 leading-tight'>Tietosuojaseloste näkyy tapahtumasivun etusivulla, voit antaa linkin olemassa olevaan sivuun tai ladata erillisen PDF- tiedoston.</p>
         </div>
         <div className="w-full mt-5">
            <RadioGroup onValueChange={(value) => setSelectedOption(value)} defaultValue={selectedOption}>
               <div className="flex items-center">
                  <div className='mr-5'>
                     <RadioGroupItem value="link" id="link" className="mr-2" />
                     <Label htmlFor="link" className="font-normal">Käytä linkkiä</Label>
                  </div>
                  <div>
                     <RadioGroupItem value="pdf" id="pdf" className="mr-2" />
                     <Label htmlFor="pdf" className="font-normal">Käytä pdf</Label>
                  </div>
               </div>
               <div className='max-w-[50%] max-md:max-w-full w-full mt-1'>
                  {selectedOption === "link" && (
                     <div className='w-full'>
                        <Input
                           type="text"
                           value={inputValue}
                           onChange={(e) => setInputValue(e.target.value)}
                           className="bg-white w-full mb-1"
                        />
                     </div>
                  )}
                  {selectedOption === "pdf" && (
                     <Fragment>
                        <Button className="mb-1 block">
                           {rawSelectedFile
                              ? <label
                                 htmlFor="pdf-upload"
                                 className="cursor-pointer w-full h-full italic"
                              >
                                 {rawSelectedFile.name}
                              </label>
                              : <label
                                 htmlFor="pdf-upload"
                                 className="cursor-pointer w-full h-full"
                              >
                                 Lisää tietosuojaseloste
                              </label>
                           }
                           <input
                              type="file"
                              id="pdf-upload"
                              accept='*'
                              onChange={handleFileChanges}
                              className="hidden"
                           />
                        </Button>

                        {pdfUrl && (
                           <div className='w-full flex items-center justify-between'>
                              <Button variant="link" type="button" asChild>
                                 <Link className='flex items-center !p-0 !h-7' target="_blank" rel="noopener noreferrer" href={pdfUrl}><Eye className="mr-1 w-5 h-5" /> Uusi ladattu tietosuojaseloste</Link>
                              </Button>
                              <span className="cursor-pointer" onClick={() => {
                                 setRawSelectedFile(null);
                                 setPdfUrl(null);
                              }}>
                                 <X className="w-4 h-4" />
                              </span>
                           </div>

                        )}

                        {privacy !== null && !pdfUrl && privacy?.pdf_privacy && (
                           <Button variant="link" type="button" asChild>
                              <Link className='flex items-center !p-0 !h-7' target="_blank" rel="noopener noreferrer" href={storage.getFileView("privacy_statement", privacy.pdf_privacy)}><Eye className="mr-1 w-5 h-5" /> Näytä tietosuojaseloste</Link>
                           </Button>
                        )}
                     </Fragment>
                  )}
               </div>
               <Button
                  onClick={selectedOption === "link" ? handleSubmitLink : handleSubmitPDF}
                  className="bg-orange-400 hover:bg-orange-500 mt-2 justify-self-start"
               >
                  Tallenna
               </Button>
            </RadioGroup>
         </div>
      </div>
   );
}

export default SettingsPrivacyForm;