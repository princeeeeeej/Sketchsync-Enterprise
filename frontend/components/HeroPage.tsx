"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  Users,
  Layers,
  Zap,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DrawCanvas from "./DrawCanvas";
import { FeatureCard } from "./hero/FeatureCard";
import { HeroVisualCard } from "./hero/HeroVisualCard";
import { HeroFooter } from "./hero/HeroFooter";
import { CursorBadge } from "./hero/CursorBadge";

export default function HeroPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-eyebrow",
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 }
      )
        .fromTo(
          ".hero-title",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
          "-=0.4"
        )
        .fromTo(
          ".hero-sub",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          ".hero-cta",
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          "-=0.5"
        )
        .fromTo(
          ".hero-hint",
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        )
        .fromTo(
          ".hero-visual",
          { y: 48, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 1.1 },
          "-=0.8"
        )
        .fromTo(
          ".hero-float",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
          "-=0.6"
        )
        .fromTo(
          ".feature-card",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 },
          "-=0.2"
        );

      gsap.to(".hero-hint-pencil", {
        x: 6,
        y: -4,
        rotation: -8,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".hero-visual-glow", {
        scale: 1.08,
        opacity: 0.7,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: containerRef }
  );

  const goToApp = () => {
    const token = localStorage.getItem("token");
    if (token) {
      window.dispatchEvent(new Event("open-create-room"));
    } else {
      router.push("/signup");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen text-stone-900 selection:bg-[#e85d4c]/15 overflow-x-hidden"
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f5f4f0] via-[#f8f9fc] to-[#eceef5]" />
        <div className="absolute top-[-10%] right-[-5%] w-[55vw] h-[55vw] rounded-full bg-[#e85d4c]/[0.07] blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-8%] w-[45vw] h-[45vw] rounded-full bg-[#2563eb]/[0.06] blur-[90px]" />
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-[#059669]/[0.04] blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(120,113,108,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(120,113,108,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <section
        ref={heroSectionRef}
        className="relative z-10 min-h-screen flex items-center px-6 md:px-12 lg:px-20 pt-28 pb-20 pointer-events-none select-none"
      >
        <DrawCanvas containerRef={heroSectionRef} />
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 xl:gap-16 items-center">
          <div className="max-w-xl">
            <p className="hero-eyebrow inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 mb-8">
              <span className="w-6 h-px bg-stone-300" />
              Real-time canvas
            </p>

            <h1 className="hero-title font-serif text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[1.02] tracking-tight text-stone-900 mb-6">
              Sketch ideas{" "}
              <span className="relative inline-block">
                together
                <svg
                  className="absolute -bottom-0.5 left-0 w-full h-2.5 text-[#e85d4c]"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8 C40 2, 80 10, 120 6 S180 4, 198 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              , live.
            </h1>

            <p className="hero-sub text-[17px] text-stone-600 max-w-md leading-relaxed font-medium mb-9">
              A collaborative whiteboard for teams who think in shapes. Drop
              into a room, draw with your crew, and export when you&apos;re
              done.
            </p>

            <div className="hero-cta flex flex-wrap items-center gap-3.5 pointer-events-auto">
              <button
                onClick={goToApp}
                className="group flex items-center gap-2.5 bg-stone-900 text-white px-7 py-3.5 rounded-full text-sm font-bold tracking-tight hover:bg-stone-800 transition active:scale-[0.98] shadow-[0_8px_30px_rgba(28,25,23,0.18)] cursor-pointer"
              >
                Start sketching
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-0.5"
                />
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-6 py-3.5 rounded-full text-sm font-bold text-stone-700 border border-stone-200 hover:border-stone-300 hover:bg-white bg-white/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition active:scale-[0.98] cursor-pointer"
              >
                See how it works
              </button>
            </div>

            <div className="hero-hint mt-10 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-white border border-stone-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] pointer-events-auto">
              <Pencil size={15} className="hero-hint-pencil text-[#e85d4c]" />
              <span className="text-[13px] text-stone-500 font-medium">
                Click &amp; drag anywhere — sketches vanish on refresh
              </span>
            </div>

            <div className="hero-visual mt-12 lg:hidden pointer-events-none">
              <div className="rounded-2xl bg-white border border-stone-200 shadow-[0_16px_50px_rgba(15,23,42,0.08)] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100 bg-[#fafafa]">
                  <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                  <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
                  <div className="w-2 h-2 rounded-full bg-[#28c840]" />
                  <span className="ml-2 text-[10px] font-mono text-stone-400">
                    room / product-sync
                  </span>
                </div>
                <div
                  className="relative h-52 bg-[#fcfcfb]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #d4d0cb 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                >
                  <div className="absolute top-[38%] left-[8%] w-[55%] h-[45%] rounded-xl border-2 border-dashed border-[#2563eb]/35 bg-white p-3 shadow-sm" />
                  <div className="absolute top-[22%] right-[10%] w-16 h-16 rounded-full border-2 border-[#e85d4c]/40 bg-white" />
                  <CursorBadge
                    name="You"
                    color="#2563eb"
                    className="absolute bottom-[22%] left-[40%]"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-stone-200 shadow-sm">
                  <div className="flex -space-x-1.5">
                    {["#e85d4c", "#2563eb", "#059669"].map((c) => (
                      <div
                        key={c}
                        className="w-5 h-5 rounded-full border-2 border-white"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-stone-700">
                    3 online
                  </span>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-stone-900 text-white shadow-sm">
                  <span className="text-[10px] text-stone-400">Latency</span>
                  <p className="text-lg font-bold leading-none">12ms</p>
                </div>
              </div>
            </div>
          </div>

          <HeroVisualCard />
        </div>
      </section>

      <section
        id="features"
        className="relative z-10 px-6 md:px-12 lg:px-20 py-24 md:py-28 pointer-events-none border-y border-stone-200/60 bg-white/70 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-3">
                Features
              </p>
              <h2 className="font-serif text-3xl md:text-[2.5rem] tracking-tight text-stone-900">
                Built for speed, not slides
              </h2>
            </div>
            <p className="text-stone-500 font-medium max-w-sm text-[15px]">
              Everything you need to whiteboard with your team — nothing you
              don&apos;t.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FeatureCard
              icon={<Layers size={20} className="text-[#2563eb]" />}
              iconBg="bg-[#2563eb]/10"
              title="Vector shapes"
              description="Rectangles, circles, lines, and text — crisp and editable on an infinite canvas."
            />
            <FeatureCard
              icon={<Users size={20} className="text-[#e85d4c]" />}
              iconBg="bg-[#e85d4c]/10"
              title="Live cursors"
              description="See teammates sketch in real time. Every stroke syncs in milliseconds."
            />
            <FeatureCard
              icon={<Zap size={20} className="text-[#059669]" />}
              iconBg="bg-[#059669]/10"
              title="Instant rooms"
              description="Create a room, share the link, start drawing. Export to PNG when you're ready."
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-24 md:py-28 pointer-events-none">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-[32px] bg-stone-900 overflow-hidden shadow-[0_32px_80px_rgba(15,23,42,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-stone-800/50 via-transparent to-[#e85d4c]/10 pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.15] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative px-8 md:px-16 py-16 md:py-20 text-center">
              <h2 className="font-serif text-3xl md:text-[2.75rem] tracking-tight text-white mb-4">
                Your next idea starts with a sketch
              </h2>
              <p className="text-stone-400 font-medium mb-10 max-w-md mx-auto text-[15px]">
                Free to use. Create an account, spin up a room, and invite your
                team in seconds.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pointer-events-auto">
                <button
                  onClick={goToApp}
                  className="bg-[#e85d4c] hover:bg-[#d44d3c] text-white px-8 py-3.5 rounded-full text-sm font-bold tracking-tight transition active:scale-[0.98] shadow-[0_8px_30px_rgba(232,93,76,0.35)] cursor-pointer"
                >
                  Create a room
                </button>
                <button
                  onClick={() => router.push("/signin")}
                  className="px-8 py-3.5 rounded-full text-sm font-bold text-stone-300 border border-stone-600 hover:border-stone-500 hover:text-white bg-stone-800/60 transition active:scale-[0.98] cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HeroFooter />
    </div>
  );
}
