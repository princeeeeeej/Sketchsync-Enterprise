"use client";

import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Pencil,
  Wifi,
} from "lucide-react";
import { CursorBadge } from "./CursorBadge";

function MiniTool({
  icon,
  active,
}: {
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div
      className={`w-7 h-7 flex items-center justify-center rounded-full ${
        active ? "bg-stone-900 text-white" : "text-stone-400"
      }`}
    >
      {icon}
    </div>
  );
}

export function HeroVisualCard() {
  return (
    <div className="hero-visual relative hidden lg:block">
      <div className="hero-visual-glow absolute -inset-6 rounded-[40px] bg-gradient-to-br from-[#e85d4c]/10 via-transparent to-[#2563eb]/10 blur-2xl opacity-50" />

      <div className="absolute -top-4 -right-4 w-full h-full rounded-3xl bg-white/40 border border-white/80 shadow-sm rotate-2" />

      <div className="relative rounded-3xl bg-white border border-stone-200/90 shadow-[0_24px_80px_rgba(15,23,42,0.1)] overflow-hidden -rotate-1 hover:rotate-0 transition-transform duration-700">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            room / product-sync
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            <Wifi size={11} />
            Live
          </span>
        </div>

        <div
          className="relative h-[340px] xl:h-[380px] bg-[#fcfcfb]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d4d0cb 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        >
          <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 p-1 bg-white border border-stone-200 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <MiniTool active icon={<MousePointer2 size={12} />} />
            <MiniTool icon={<Square size={12} />} />
            <MiniTool icon={<Circle size={12} />} />
            <MiniTool icon={<Type size={12} />} />
            <MiniTool icon={<Pencil size={12} />} />
          </div>

          <div className="absolute top-[28%] left-[10%] w-[44%] h-[38%] rounded-2xl border-2 border-dashed border-[#2563eb]/35 bg-white shadow-[0_8px_30px_rgba(37,99,235,0.08)] p-4 flex flex-col justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#2563eb]/80">
              Dashboard
            </span>
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-stone-100" />
              <div className="h-2 w-4/5 rounded-full bg-stone-100" />
              <div className="h-2 w-3/5 rounded-full bg-stone-100" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 flex-1 rounded-lg bg-[#2563eb]/10 border border-[#2563eb]/20" />
              <div className="h-6 w-12 rounded-lg bg-stone-100" />
            </div>
          </div>

          <div className="absolute top-[18%] right-[12%] w-24 h-24 rounded-full border-2 border-[#e85d4c]/45 bg-white shadow-[0_8px_24px_rgba(232,93,76,0.12)] flex items-center justify-center">
            <span className="text-[8px] font-bold uppercase tracking-widest text-[#e85d4c]/70">
              Sync
            </span>
          </div>

          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <path
              d="M200 260 C280 210, 340 280, 420 230"
              fill="none"
              stroke="#059669"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="5 4"
              opacity="0.7"
            />
          </svg>

          <CursorBadge
            name="Alex"
            color="#e85d4c"
            className="absolute bottom-[32%] right-[28%]"
            rotate
          />
          <CursorBadge
            name="You"
            color="#2563eb"
            className="absolute top-[52%] left-[38%]"
          />
        </div>
      </div>

      <div className="hero-float absolute -left-6 top-[18%] flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-stone-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex -space-x-2">
          {["#e85d4c", "#2563eb", "#059669"].map((c) => (
            <div
              key={c}
              className="w-7 h-7 rounded-full border-2 border-white"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div>
          <p className="text-[11px] font-bold text-stone-800 leading-none">
            3 online
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">In this room</p>
        </div>
      </div>

      <div className="hero-float absolute -right-2 bottom-[14%] px-4 py-3 rounded-2xl bg-stone-900 text-white shadow-[0_12px_40px_rgba(28,25,23,0.25)]">
        <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wider">
          Sync latency
        </p>
        <p className="text-2xl font-bold tracking-tight mt-0.5">
          12<span className="text-sm font-semibold text-stone-400">ms</span>
        </p>
      </div>
    </div>
  );
}
