import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
export default function Home() {
  return (
    <div className=" z-20 flex flex-col items-center justify-start min-h-screen py-2 mt-10">
      <div className="flex flex-col justify-center items-center my-5">
        <Image src={"/hero.svg"} alt="Hero-Section" height={500} width={500} />

        <h1 className="z-20 mt-5 text-center text-6xl font-extrabold tracking-tight leading-[1.3] bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent dark:from-sky-300 dark:via-blue-400 dark:to-indigo-400">
          Vibe Code With Intelligence
        </h1>
      </div>

      <p className="mt-2 max-w-2xl px-5 py-10 text-center text-lg text-gray-600 dark:text-gray-400">
        Build, edit, and ship code faster with an AI-powered editor designed for
        developers who love to vibe code.
      </p>
      <Link href={"/dashboard"}>
        <Button variant={"brand"} className="mb-4" size={"lg"}>
          Get Started
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
}
