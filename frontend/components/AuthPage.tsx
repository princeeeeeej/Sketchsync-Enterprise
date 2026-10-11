"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import DrawCanvas from "./DrawCanvas";
import { AuthHeader } from "./auth/AuthHeader";
import { AuthForm } from "./auth/AuthForm";
import { AuthPreviewCard } from "./auth/AuthPreviewCard";

interface AuthPageProps {
  isSignIn: boolean;
}

export default function AuthPage({ isSignIn }: AuthPageProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/");
    }
  }, [router]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".auth-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 }
      )
        .fromTo(
          ".auth-card",
          { y: 30, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.9 },
          "-=0.4"
        )
        .fromTo(
          ".auth-form-item",
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
          "-=0.5"
        );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen max-w-full bg-[#f5f4f0] text-stone-900 selection:bg-[#e85d4c]/15 overflow-hidden flex flex-col"
    >
      <DrawCanvas />

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

      <AuthHeader />

      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-4 flex-1 flex items-center justify-center min-h-0">
        <div className="auth-card w-full rounded-3xl bg-white/85 backdrop-blur-xl border border-stone-200/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <AuthForm isSignIn={isSignIn} />

          <div className="lg:col-span-5 bg-gradient-to-br from-[#faf9f5] to-[#eceef5] p-8 border-t lg:border-t-0 lg:border-l border-stone-200/80 hidden lg:flex flex-col justify-between relative overflow-hidden">
            <AuthPreviewCard isSignIn={isSignIn} />
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-2 text-center text-xs text-stone-400 shrink-0">
        &copy; 2026 SketchSync. All rights reserved.
      </footer>
    </div>
  );
}