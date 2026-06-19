import { WaiverForm } from "@/components/WaiverForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f3eee7] text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-[980px] items-center px-4 py-5 sm:px-6 md:px-8 md:py-8">
        <WaiverForm />
      </div>
    </main>
  );
}
