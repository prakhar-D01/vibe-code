import Image from "next/image";
import { Button } from "@/components/ui/button";
import UserButton from "@/modules/auth/components/user-button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button>Get started</Button>
      <UserButton></UserButton>
    </div>
  );
}
