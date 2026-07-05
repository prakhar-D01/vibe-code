import { cn } from "@/lib/utils";
import { Footer } from "@/modules/home/footer";
import { Header } from "@/modules/home/header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "VibeCode - Editor ",
    default: "Code Editor For VibeCoders - VibeCode",
  },
};
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-black">
      <Header />

      <div
        className={cn(
          "absolute inset-0 z-0",
          "bg-size-[40px_40px]",
          "bg-[linear-gradient(to_right,#d4d4d8_1px,transparent_1px),linear-gradient(to_bottom,#d4d4d8_1px,transparent_1px)]",
          "dark:bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)]",
        )}
      />
      <div
        className="
        pointer-events-none absolute inset-0 z-10  bg-white/80 dark:bg-black/80 mask-[radial-gradient(circle_at_center,transparent_15%,black_75%)] "
      />
      <main className="relative z-20">{children}</main>

      <Footer />
    </div>
  );
}