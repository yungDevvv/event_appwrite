"use client";

import { useEffect } from "react";

const { signOut } = require("@/lib/appwrite/server/appwrite");

export default function Page() {
 
    useEffect(() => {
        (async () => {
            await signOut();
        })();
    }, []);
    return <div>Logging out...</div>;
}