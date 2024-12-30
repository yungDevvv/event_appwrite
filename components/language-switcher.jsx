"use client"

import {
   DropdownMenu,
   DropdownMenuTrigger,
   DropdownMenuContent,
   DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import { CheckIcon, GlobeIcon } from "lucide-react"
import { useRouter } from 'next/navigation';
import { useLocale } from "next-intl";

export default function LanguageSwitcher({ className, locale }) {
   const router = useRouter();
   const currentLocale = useLocale();

   const changeLanguage = async (locale) => {
      document.cookie = `locale=${locale}; path=/`;
      router.refresh();
   };
   return (
      <React.Fragment>
         <div className={className}>
            <DropdownMenu>
               <DropdownMenuTrigger className="bg-[#FF8F00] hover:bg-[#FFA726] transition-all text-white rounded-md px-3 py-2 flex items-center gap-2">
                  <GlobeIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                     {currentLocale.toUpperCase()} 
                  </span>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="start" sideOffset={5} className="w-[100px] bg-[#0a0a0a] border border-zinc-800">
                  <DropdownMenuItem 
                     onClick={() => changeLanguage("fi")} 
                     className="flex items-center justify-between hover:bg-[#FF8F00] focus:bg-[#FF8F00] cursor-pointer text-white"
                  >
                     <span className="font-medium">Suomi</span>
                     {currentLocale === "fi" && <CheckIcon className="h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                     onClick={() => changeLanguage("en")} 
                     className="flex items-center justify-between hover:bg-[#FF8F00] focus:bg-[#FF8F00] cursor-pointer text-white"
                  >
                     <span className="font-medium">English</span>
                     {currentLocale === "en" && <CheckIcon className="h-4 w-4" />}
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </React.Fragment>
   )
}