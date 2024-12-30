"use client"

import Link from "next/link"

export const Error = ({ title, description, linkText, linkUrl }) => {
   return (
      <div className="fixed w-screen h-screen overflow-hidden bg-gradient-to-br from-orange-50 to-orange-200 flex items-center flex-col justify-center">
         <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="text-center space-y-8">
               <div>
                  <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <h2 className="text-red-500 text-2xl font-semibold mb-2">
                     {title}
                  </h2>
               </div>
               {description && (
                  <p className="text-gray-600 mb-4">
                     {description}
                  </p>
               )}
               {linkText && (
                  <Link
                     href={linkUrl}
                     className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-300"
                  >
                     {linkText}
                  </Link>
               )}
            </div>
         </div>
      </div>
   )
}