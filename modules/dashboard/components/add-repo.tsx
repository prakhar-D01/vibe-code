"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import GithubRepoModal from "./github-repo-modal";

const AddRepo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group px-6 py-6 flex flex-row justify-between items-center border rounded-lg bg-muted cursor-pointer 
        transition-all duration-300 ease-in-out
        hover:bg-background hover:border-blue-500 hover:scale-[1.02]
          shadow-[0_2px_10px_rgba(0,0,0,0.08)]
          hover:shadow-[0_10px_30px_rgba(59,130,246,0.20)]"
      >
        <div className="flex flex-row justify-center items-start gap-4">
          <Button
            variant={"outline"}
            className="flex justify-center items-center bg-white group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 group-hover:border-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
            size={"icon"}
          >
            <ArrowDown
              size={30}
              className="transition-transform duration-300 group-hover:translate-y-1"
            />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold  text-blue-600 dark:text-blue-400">
              Open Github Repository
            </h1>
            <p className="text-sm text-muted-foreground max-w-55">
              Work with your repositories in our editor
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <Image
            src={"/github.svg"}
            alt="Open GitHub repository"
            width={150}
            height={150}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>

      <GithubRepoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default AddRepo;
