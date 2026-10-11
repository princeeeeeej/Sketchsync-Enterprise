"use client";

import { ArrowRight } from "lucide-react";

export function HeroFooter() {
  return (
    <footer className="relative z-10 px-6 md:px-12 lg:px-20 py-10 bg-white border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-4 pointer-events-auto">
      <div className="flex items-center gap-2.5">
        <img src="/logo.png" alt="SketchSync" className="w-5 h-5 opacity-80" />
        <span className="font-serif text-xl font-medium tracking-tight text-stone-900">
          SketchSync
        </span>
        <span className="text-xs text-stone-400 ml-1">© 2026</span>
      </div>
      <div className="flex items-center gap-6 text-xs text-stone-400 font-medium">
        <a href="#" className="hover:text-stone-700 transition">
          Terms
        </a>
        <a href="#" className="hover:text-stone-700 transition">
          Privacy
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-stone-700 transition flex items-center gap-1"
        >
          GitHub <ArrowRight size={11} />
        </a>
      </div>
    </footer>
  );
}
