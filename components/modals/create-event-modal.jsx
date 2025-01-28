"use client";

import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
   DialogDescription
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/date-picker';
import { Input } from '@/components/ui/input';
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { useEffect, useState, useRef } from 'react';
import MultipleSelectWithCheckbox from "../ui/MultipleSelectWithCheckbox";
import { useModal } from '@/hooks/use-modal';
import { Eye, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn, generateId, generateInviteId } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Separator } from "@/components/ui/separator";

import dynamic from 'next/dynamic';
import { createDocument, createFile, getLoggedInUser, updateDocument } from '@/lib/appwrite/server/appwrite';
import { storage } from '@/lib/appwrite/client/appwrite';
const CKeditor = dynamic(() => import('@/components/ck-editor'), {
   ssr: false,
   loading: () => <div className='w-full min-h-[190px] flex justify-center items-center py-10'><Loader2 className='animate-spin text-clientprimary' /></div>
});

const eventTypes = [
   { value: 'Maastoautot', label: 'Maastoautot', image: '/images/rallicross.jpg' },
   { value: 'Mönkijät', label: 'Mönkijät', image: '/images/offroad.jpg' },
   { value: 'Ralli', label: 'Ralli', image: '/images/motocross.jpg' },
   { value: 'Enduro', label: 'Enduro', image: '/images/monkijasafari.jpg' },
   { value: 'Sähköpyörät', label: 'Sähköpyörät', image: '/images/sahkopyoraily.jpg' },
   { value: 'muu', label: 'Muu, mikä?', image: '/images/default.jpg' }
];

const minutes = ["00", "15", "30", "45"];
const hours = ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "00"];

const formSchema = z.object({
   eventType: z.string().min(1, {
      message: "Valitse tapahtumatyyppi."
   }),
   clientName: z.string().min(1, "Asiakkaan nimi vaaditaan."),
   contactPerson: z.string().min(1, "Yhteyshenkilön nimi vaaditaan."),
   contactEmail: z.string().email("Virheellinen sähköpostiosoite").min(1, "Sähköpostiosoite vaaditaan."),
   contactPhone: z.string().min(1, "Puhelinnumero vaaditaan."),
   groupSize: z.preprocess((val) => Number(val), z.number().positive("Ryhmän koon on oltava suurempi kuin 0.")),
   eventAddress: z.string().min(1, "Tapahtuman osoite vaaditaan."),
   eventPlace: z.string().min(1, "Tapahtuman paikka vaaditaan."),
   eventName: z.string().min(1, "Tapahtuman nimi vaaditaan."),
   eventDate: z.date({ message: "Valitse tapahtuman päivämäärä." }),
   eventTimeHours: z.any().optional(),
   eventTimeMinutes: z.any().optional(),
   instructionsFile: z.any().optional(),
   additionalServices: z.any().optional(),
   eventImage: z.any().optional()
});

const CreateEventModal = () => {
   const router = useRouter();
   const { toast } = useToast();
   const { isOpen, onClose, type, data } = useModal();
   const formRef = useRef(null);

   const [eventImage, setEventImage] = useState(null);
   const [eventDescriptionText, setEventDescriptionText] = useState(data?.event?.fi_event_description ? data.event.fi_event_description : "");
   const [enEventDescriptionText, setEnEventDescriptionText] = useState(data?.event?.en_event_description ? data.event.en_event_description : "");
   const [customEventType, setCustomEventType] = useState("");
   const [showCustomInput, setShowCustomInput] = useState(false);

   const handleChangeFI = (event, editor) => {
      const data = editor.getData();
      setEventDescriptionText(data);
   };

   const handleChangeEN = (event, editor) => {
      const data = editor.getData();
      setEnEventDescriptionText(data);
   };
   const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
         eventName: '',
         clientName: '',
         contactPerson: '',
         contactEmail: '',
         contactPhone: '',
         eventDate: null,
         eventType: '',
         eventAddress: '',
         eventPlace: '',
         groupSize: 1,
         eventTimeHours: "00",
         eventTimeMinutes: "00",
         additionalServices: [],
         instructionsFile: null,
         eventImage: null
      }
   });

   const isModalOpen = isOpen && type === "create-event";
   const isLoading = form.formState.isSubmitting;
   const { reset, setValue } = form;

   const onSubmit = async (datar) => {
      const user = await getLoggedInUser();

      if (data?.duplicate) {
         /* Create Event */
         if (user) {
            let instructionUploadedFile;
            let eventImageUploadedFile;

            if (datar?.instructionsFile) {
               let fileId = await createFile("instructions_files", datar.instructionsFile[0]);

               instructionUploadedFile = fileId;
            }

            if (datar?.eventImage) {
               let fileId = await createFile("event_image", datar.eventImage[0]);

               eventImageUploadedFile = fileId;
            }

            let document_id = generateId()

            const { error: createdEventError } = await createDocument("main_db", "events", {
               document_id,
               body: {
                  users: user.$id,
                  event_name: datar.eventName,
                  client_name: datar.clientName,
                  contact_person: datar.contactPerson,
                  contact_email: datar.contactEmail,
                  contact_phone: datar.contactPhone,
                  group_size: datar.groupSize,
                  event_type: datar.eventType,
                  event_date: datar.eventDate,
                  event_time: datar.eventTimeHours + ":" + datar.eventTimeMinutes,
                  event_address: datar.eventAddress,
                  event_place: datar.eventPlace,
                  fi_event_description: eventDescriptionText,
                  en_event_description: enEventDescriptionText,
                  additional_services: datar.additionalServices,
                  instructions_file: datar?.instructionsFile ? instructionUploadedFile : data?.event?.instructions_file,
                  event_image: datar?.eventImage ? eventImageUploadedFile : data?.event?.event_image,
                  invintation_id: document_id,
               }
            });

            if (createdEventError) {
               toast({
                  variant: "supabaseError",
                  description: "Tuntematon virhe luotaessa tapahtumaa."
               });
               return;
            }

            const { error } = await createDocument("main_db", "event_member", {
               body: {
                  users: user.$id,
                  events: document_id,
               }
            });

            if (error) {
               toast({
                  variant: "supabaseError",
                  description: "Tuntematon virhe lisäessä sinut osallistujaksi."
               });
               return;
            }

            toast({
               variant: "success",
               title: "Tapahtuma",
               description: "Tapahtuma on luotu onnistuneesti."
            });

            router.pathname === '/dashboard/events'
               ? (
                  router.push('/dashboard/events'),
                  router.refresh()
               )
               : (
                  router.push('/dashboard/events'),
                  router.refresh()
               )

            onClose()

         }

         return;
      }
      if (data.edit) {
         if (user) {
            let instructionUploadedFile;
            let eventImageUploadedFile;

            if (datar?.instructionsFile) {
               let fileId = await createFile("instructions_files", datar.instructionsFile[0]);

               instructionUploadedFile = fileId;
            }

            if (datar?.eventImage) {
               let fileId = await createFile("event_image", datar.eventImage[0]);

               eventImageUploadedFile = fileId;
            }

            const { error: updateError } = await updateDocument("main_db", "events", data.event.$id, {
               event_name: datar.eventName,
               client_name: datar.clientName,
               contact_person: datar.contactPerson,
               contact_email: datar.contactEmail,
               contact_phone: datar.contactPhone,
               group_size: datar.groupSize,
               event_type: datar.eventType,
               event_date: datar.eventDate,
               event_time: datar.eventTimeHours + ":" + datar.eventTimeMinutes,
               event_address: datar.eventAddress,
               event_place: datar.eventPlace,
               fi_event_description: eventDescriptionText,
               en_event_description: enEventDescriptionText,
               additional_services: datar.additionalServices,
               instructions_file: datar?.instructionsFile ? instructionUploadedFile : data?.event?.instructions_file,
               event_image: datar?.eventImage ? eventImageUploadedFile : data?.event?.event_image
            });

            if (updateError) {
               toast({
                  variant: "supabaseError",
                  description: "Tuntematon virhe päivittäessä tapahtumaa."
               });
               return;
            }

            toast({
               variant: "success",
               title: "Tapahtuma",
               description: "Tapahtuma on päivitetty onnistuneesti!"
            });

            router.push('/dashboard/events');
            router.refresh();
            onClose();
         }

         return;
      } else {
         /* Create Event */
         if (user) {
            let instructionUploadedFile;
            let eventImageUploadedFile;

            if (datar?.instructionsFile) {
               let fileId = await createFile("instructions_files", datar.instructionsFile[0]);

               instructionUploadedFile = fileId;
            }

            if (datar?.eventImage) {
               let fileId = await createFile("event_image", datar.eventImage[0]);

               eventImageUploadedFile = fileId;
            }

            let document_id = generateId()

            const { error: createdEventError } = await createDocument("main_db", "events", {
               document_id,
               body: {
                  users: user.$id,
                  event_name: datar.eventName,
                  client_name: datar.clientName,
                  contact_person: datar.contactPerson,
                  contact_email: datar.contactEmail,
                  contact_phone: datar.contactPhone,
                  group_size: datar.groupSize,
                  event_type: datar.eventType,
                  event_date: datar.eventDate,
                  event_time: datar.eventTimeHours + ":" + datar.eventTimeMinutes,
                  event_address: datar.eventAddress,
                  event_place: datar.eventPlace,
                  fi_event_description: eventDescriptionText,
                  en_event_description: enEventDescriptionText,
                  additional_services: datar.additionalServices,
                  instructions_file: datar?.instructionsFile ? instructionUploadedFile : data?.event?.instructions_file,
                  event_image: datar?.eventImage ? eventImageUploadedFile : data?.event?.event_image,
                  invintation_id: document_id,
               }
            });

            if (createdEventError) {
               toast({
                  variant: "supabaseError",
                  description: "Tuntematon virhe luotaessa tapahtumaa."
               });
               return;
            }

            const { error } = await createDocument("main_db", "event_member", {
               body: {
                  users: user.$id,
                  events: document_id,
               }
            });

            if (error) {
               toast({
                  variant: "supabaseError",
                  description: "Tuntematon virhe lisäessä sinut osallistujaksi."
               });
               return;
            }

            toast({
               variant: "success",
               title: "Tapahtuma",
               description: "Tapahtuma on luotu onnistuneesti."
            });

            router.pathname === '/dashboard/events'
               ? (
                  router.push('/dashboard/events'),
                  router.refresh()
               )
               : (
                  router.push('/dashboard/events'),
                  router.refresh()
               )

            onClose()

         }
      }
   };

   useEffect(() => {
      if (data && data.event) {
         const newEventDate = new Date(data.event.event_date);
         const time = data.event.event_time.split(":");
         const minutes = time[1];
         const hours = time[0];

         reset({
            eventName: data.event.event_name || '',
            clientName: data.event.client_name || '',
            contactPerson: data.event.contact_person || '',
            contactEmail: data.event.contact_email || '',
            contactPhone: data.event.contact_phone || '',
            eventDate: newEventDate || null,
            eventType: data.event.event_type || '',
            groupSize: data.event.group_size || 1,
            eventTimeHours: hours,
            eventTimeMinutes: minutes,
            // eventTime: data.event.event_time || '',
            additionalServices: data.event.additional_services || [],
            eventAddress: data.event.event_address || '',
            eventPlace: data.event.event_place || '',
            instructionsFile: null,
            eventImage: null
         });
      }
   }, [data, reset]);

   return (
      <Dialog open={isModalOpen} onOpenChange={onClose}>
         <DialogContent className='bg-white text-black p-0 max-h-[90vh] overflow-hidden flex flex-col'>
            <DialogHeader className='py-3 px-6 sticky top-0 bg-white z-10 border-b'>
               <DialogTitle className='text-2xl text-center font-bold'>
                  {data.edit
                     ? "Muokkaa tapahtuma"
                     : "Luo uusi tapahtuma"
                  }
               </DialogTitle>
               <Button
                  onClick={onClose}
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-zinc-100 rounded-md p-2 h-auto"
               >
                  <X className="h-5 w-5" />
               </Button>
            </DialogHeader>
            <DialogDescription></DialogDescription>
            <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
               <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="px-6 space-y-4 overflow-y-auto flex-1 pb-5">
                  <div className="flex max-sm:block max-sm:space-y-3">

                     {/* Client Name */}
                     <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                           <FormItem className="mr-1 max-sm:ml-0 w-full">
                              <FormLabel className="block mb-1">Asiakkaan nimi</FormLabel>
                              <FormControl>
                                 <Input {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     {/* Event Name */}
                     <FormField
                        control={form.control}
                        name="eventName"
                        render={({ field }) => (
                           <FormItem className="ml-1 max-sm:mr-0 w-full">
                              <FormLabel className="block mb-1">Tapahtuman nimi</FormLabel>
                              <FormControl>
                                 <Input {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>

                  <Separator className="!my-4" />

                  <div className="space-y-4">
                     <h3 className="text-lg font-medium">Yhteystiedot</h3>
                     <div className="flex gap-4 max-[900px]:flex-wrap">
                        {/* Contact Person */}
                        <FormField
                           control={form.control}
                           name="contactPerson"
                           render={({ field }) => (
                              <FormItem className="w-full">
                                 <FormLabel>Yhteyshenkilö</FormLabel>
                                 <FormControl>
                                    <Input {...field} />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />

                        {/* Contact Email */}
                        <FormField
                           control={form.control}
                           name="contactEmail"
                           render={({ field }) => (
                              <FormItem className="w-full">
                                 <FormLabel>Sähköposti</FormLabel>
                                 <FormControl>
                                    <Input type="email" {...field} />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />

                        {/* Contact Phone */}
                        <FormField
                           control={form.control}
                           name="contactPhone"
                           render={({ field }) => (
                              <FormItem className="w-full">
                                 <FormLabel>Puhelinnumero</FormLabel>
                                 <FormControl>
                                    <Input type="tel" {...field} />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     </div>
                  </div>

                  <Separator className="!my-4" />

                  <div className="flex items-center max-sm:block max-sm:space-y-3 ">

                     {/* Event Address */}
                     <FormField
                        control={form.control}
                        name="eventAddress"
                        render={({ field }) => (
                           <FormItem className="mr-1 max-sm:mr-0 w-full">
                              <FormLabel className="block mb-1">Tapahtuman osoite</FormLabel>
                              <FormControl>
                                 <Input {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     {/* Event Place */}
                     <FormField
                        control={form.control}
                        name="eventPlace"
                        render={({ field }) => (
                           <FormItem className="ml-1 max-sm:ml-0 w-full">
                              <FormLabel className="block mb-1">Tapahtuman paikkakunta</FormLabel>
                              <FormControl>
                                 <Input placeholder="Helsinki" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                  </div>

                  <div className="flex max-sm:block max-sm:space-y-3">

                     {/* Event Date */}
                     <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                           <FormItem className="mr-1 max-sm:mr-0 w-full ">
                              <FormLabel className="block mb-1">Tapahtuman päivämäärä</FormLabel>
                              <FormControl>
                                 <DatePicker {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     >
                     </FormField>

                     {/* Event Time */}
                     <div className='w-full'>
                        <FormLabel className="block mb-1">Tapahtuman kellonaika</FormLabel>
                        <div className='flex w-full items-center'>
                           <FormField
                              control={form.control}
                              name="eventTimeHours"
                              render={({ field }) => (
                                 <FormItem className="max-sm:ml-0 w-full">
                                    <FormControl>
                                       <Select
                                          onValueChange={field.onChange}
                                       >
                                          <SelectTrigger className="w-full">
                                             <SelectValue placeholder={data && data?.event?.event_time ? data.event.event_time.split(":")[0] : "00"} />
                                          </SelectTrigger>
                                          <SelectContent>
                                             <SelectGroup>
                                                {hours.map(hour => (
                                                   <SelectItem className="m-0 p-1" key={hour} value={hour}>
                                                      {hour}
                                                   </SelectItem>
                                                ))}
                                             </SelectGroup>
                                          </SelectContent>
                                       </Select>
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           >
                           </FormField>
                           <span className="px-1"> : </span>
                           <FormField
                              control={form.control}
                              name="eventTimeMinutes"
                              render={({ field }) => (
                                 <FormItem className="max-sm:ml-0 w-full">
                                    {/* <FormLabel className="block mb-1">Tapahtuman kellonaika</FormLabel> */}
                                    <FormControl>
                                       <Select
                                          onValueChange={field.onChange}
                                       >
                                          <SelectTrigger className="w-full capitalize">
                                             <SelectValue placeholder={data && data?.event?.event_time ? data.event.event_time.split(":")[1] : "00"} />
                                          </SelectTrigger>
                                          <SelectContent>
                                             <SelectGroup>
                                                {minutes.map(minutes => (
                                                   <SelectItem key={minutes} value={minutes}>
                                                      {minutes}
                                                   </SelectItem>
                                                ))}
                                             </SelectGroup>
                                          </SelectContent>
                                       </Select>
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           >
                           </FormField>
                        </div>

                     </div>
                  </div>

                  <div className="flex max-sm:block max-sm:space-y-3">
                     {/* Group size */}
                     <FormField
                        control={form.control}
                        name="groupSize"
                        render={({ field }) => (
                           <FormItem className="mr-1 max-sm:mr-0 w-full">
                              <FormLabel className="block mb-1">Ryhmän koko</FormLabel>
                              <FormControl>
                                 <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     {/* Event Type */}
                     <FormField
                        control={form.control}
                        name="eventType"
                        render={({ field }) => (
                           <FormItem className="ml-1 max-sm:ml-0 w-full">
                              <FormLabel className="block mb-1">Tapahtuman tyyppi</FormLabel>
                              <FormControl>
                                 <div className="space-y-2">
                                    <Select onValueChange={(value) => {
                                       if (value === 'muu') {
                                          setShowCustomInput(true);
                                       } else {
                                          setShowCustomInput(false);
                                          setCustomEventType("");
                                       }
                                       field.onChange(value);
                                    }}>
                                       <SelectTrigger className="w-full capitalize">
                                          <SelectValue placeholder={data && data?.event?.event_type ? data.event.event_type : "Valitse tapahtuman tyyppi"} />
                                       </SelectTrigger>
                                       <SelectContent>
                                          <SelectGroup>
                                             {eventTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                   {type.label}
                                                </SelectItem>
                                             ))}
                                          </SelectGroup>
                                       </SelectContent>
                                    </Select>
                                    {showCustomInput && (
                                       <Input
                                          placeholder="Kirjoita oma tapahtuman tyyppi"
                                          value={customEventType}
                                          onChange={(e) => {
                                             const newValue = e.target.value;
                                             setCustomEventType(newValue);
                                             if (newValue.trim() !== '') {
                                                field.onChange(newValue);
                                             }
                                          }}
                                       />
                                    )}
                                 </div>
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </div>

                  {/* Additional Services */}
                  <FormField
                     control={form.control}
                     name="additionalServices"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Lisäpalvelut</FormLabel>
                           <FormControl>
                              <MultipleSelectWithCheckbox
                                 placeholder="Valitse lisäpalvelut"
                                 options={['Ruokailu', 'Kuljetus', 'Valokuvaus', 'Majoitus']}
                                 field={field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <div className='w-full'>
                     <FormLabel>Ohjelma - FI / EN</FormLabel>
                     <div className='flex max-[1100px]:flex-wrap'>
                        <div className='max-w-[50%] max-[1100px]:max-w-[99%] min-h-[190px] w-full mr-1'>
                           <CKeditor
                              content={eventDescriptionText}
                              handleChange={handleChangeFI} />
                        </div>
                        <div className='max-w-[50%] max-[1100px]:max-w-[99%] w-full min-h-[190px] ml-1 max-[1100px]:ml-0 max-[1100px]:mt-2'>
                           <div className=' relative'>
                              <CKeditor
                                 content={enEventDescriptionText}
                                 handleChange={handleChangeEN} />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex max-sm:block max-sm:space-y-3">
                     <FormField
                        control={form.control}
                        name="instructionsFile"
                        render={({ field }) => (
                           <FormItem className="mr-1 max-sm:ml-0 w-full">
                              <FormLabel className="block mb-1" >Tapahtumaohjeistus</FormLabel>
                              <FormControl className="cursor-pointer">
                                 <label className={cn('w-full  cursor-pointer text-white inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2')}>

                                    {form.getValues("instructionsFile")
                                       ? <span className="text-sm italic">{form.getValues("instructionsFile")[0].name}</span>
                                       : <span className="text-sm">{form.formState.defaultValues.instructionsFile ? "Vaihda ohjeistus" : "Lataa ohjeistus"}</span>
                                    }

                                    <Input type="file" className="hidden" onChange={(e) => field.onChange(e.target.files)} />
                                 </label>
                              </FormControl>
                              <FormMessage />

                              {form.getValues("instructionsFile") && (
                                 <div className="w-full flex items-center justify-between">

                                    <Button variant="link" type="button" asChild>
                                       <Link className='flex items-center !p-0 !h-7' target="_blank" rel="noopener noreferrer" href={URL.createObjectURL(form.getValues("instructionsFile")[0])}><Eye className="mr-1 w-5 h-5" /> Näytä uusi ohjeistus</Link>
                                    </Button>
                                    <span className="cursor-pointer" onClick={() => {
                                       setValue("instructionsFile", null);
                                    }}>
                                       <X className="w-4 h-4" />
                                    </span>
                                 </div>
                              )}

                              {data && data.event?.instructions_file && form.getValues("instructionsFile") === null && (
                                 <Button variant="link" type="button" asChild>
                                    <Link className='flex items-center !p-0 !h-7' target="_blank" rel="noopener noreferrer" href={storage.getFileView("instructions_files", data.event.instructions_file)}><Eye className="mr-1 w-5 h-5" /> Näytä ohjeistus</Link>
                                 </Button>
                              )}
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name="eventImage"
                        render={({ field }) => (
                           <FormItem className="ml-1 max-sm:ml-0 w-full">
                              <FormLabel className="block mb-1">Tapahtuman kuva</FormLabel>
                              <FormControl className="cursor-pointer">
                                 <label className={cn('w-full  cursor-pointer text-white inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2', eventImage && 'italic')}>

                                    {eventImage
                                       ? <span className="text-sm">{eventImage.name}</span>
                                       : <span className="text-sm">{data && data.event?.event_image ? "Vaihda kuva" : "Lataa kuva"}</span>
                                    }
                                    <Input type="file" className="hidden" onChange={(e) => {
                                       field.onChange(e.target.files)
                                       setEventImage(e.target?.files[0] ? e.target.files[0] : null)
                                    }} />
                                 </label>
                              </FormControl>
                              <FormMessage />

                              {data && data.event?.event_image && !eventImage && (
                                 <Button variant="link" type="button" asChild>
                                    <Link className='flex items-center !p-0 !h-7' target="_blank" rel="noopener noreferrer" href={storage.getFilePreview("event_image", data.event.event_image)}><Eye className="mr-1 w-5 h-5" /> Näytä kuva</Link>
                                 </Button>
                              )}

                              {eventImage && (
                                 <div className="w-full flex items-center justify-between">
                                    <Button variant="link" type="button" asChild>
                                       <Link className='flex items-center !p-0 !h-7' target="_blank" rel="noopener noreferrer" href={URL.createObjectURL(eventImage)}><Eye className="mr-1 w-5 h-5" /> Näytä uusi kuva</Link>
                                    </Button>
                                    <span className="cursor-pointer" onClick={() => {
                                       setEventImage(null);
                                       setValue("eventImage", null);
                                    }}>
                                       <X className="w-4 h-4" />
                                    </span>
                                 </div>
                              )}
                           </FormItem>

                        )}
                     />
                  </div>
               </form>
               <DialogFooter className="pb-3 sticky bottom-0 bg-white border-t p-4 ">
                  {data?.duplicate && (
                     <Button 
                        className="bg-clientprimary hover:bg-clientprimaryhover text-base" 
                        onClick={() => formRef.current?.requestSubmit()}
                        disabled={isLoading}
                     >
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Tallenna"}
                     </Button>
                  )}
                  {!data?.duplicate && (
                     <Button 
                        className="bg-clientprimary hover:bg-clientprimaryhover text-base" 
                        onClick={() => formRef.current?.requestSubmit()}
                        disabled={isLoading}
                     >
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : data.edit ? "Tallenna" : "Tallenna"}
                     </Button>
                  )}
               </DialogFooter>
            </Form>
         </DialogContent>
      </Dialog>
   );
}

export default CreateEventModal;
