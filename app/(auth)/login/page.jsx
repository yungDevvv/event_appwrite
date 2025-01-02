"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signInAdminDashboard } from "@/lib/appwrite/server/appwrite";


export default function Page() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleLogin = async (formData) => {
    setErrorMessage("");
    setIsLoading(true);

    const { data, error } = await signInAdminDashboard(formData.email, formData.password);

    console.log(data, error)

    if (error?.message === "Invalid credentials. Please check the email and password.") {
      setIsLoading(false);
      setErrorMessage("Virheelliset kirjautumistiedot. Tarkista sähköposti ja salasana.");
      return;
    }

    if (data) {
      router.push("/")
    }

    setIsLoading(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center px-4 bg-orange-100">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Kirjaudu sisään</CardTitle>
        </CardHeader>
        <CardContent>

          <form onSubmit={handleSubmit(handleLogin)} className="grid gap-4">
            {errorMessage && <p className="text-sm -my-2 text-red-500">{errorMessage}</p>}
            <div className="grid gap-2">
              <Label htmlFor="email">Sähköposti</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: "Sähköposti on pakollinen" })}
              />
              {errors.email && <p className="text-red-500 text-sm -mt-1">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Salasana</Label>
                {/* <Link href="#" className="ml-auto inline-block text-sm underline">
                  Unohditko salasanasi?
                </Link> */}
              </div>
              <Input
                id="password"
                type="password"
                {...register("password", { required: "Salasana on pakollinen" })}
              />
              {errors.password && <p className="text-red-500 text-sm -mt-1">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full mt-4 text-md bg-orange-400 hover:bg-orange-500 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Kirjaudu"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
