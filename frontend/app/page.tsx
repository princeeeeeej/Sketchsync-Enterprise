import HeroPage from "@/components/HeroPage";
import Navbar from "@/components/Navbar";


export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#f5f4f0] text-stone-900 selection:bg-[#e85d4c]/15">
      <Navbar />
      <HeroPage />
    </div>
  );
}
