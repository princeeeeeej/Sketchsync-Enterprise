"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AuthHeader() {
  return (
    <header className="auth-header relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-4 pb-2 flex items-center justify-between shrink-0">
      <Link href="/" className="flex items-center gap-2.5 group">
        <img
          src="/logo.png"
          alt="SketchSync"
          className="w-6 h-6 opacity-90 group-hover:scale-105 transition-transform"
        />
        <span className="font-serif text-2xl tracking-tight text-stone-900 font-medium">
          SketchSync
        </span>
      </Link>

      <Link
        href="/"
        className="flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white/80 hover:bg-white border border-stone-200/80 px-4 py-2 rounded-full transition shadow-sm"
      >
        <ArrowLeft size={14} />
        Back to Home
      </Link>
    </header>
  );
}
