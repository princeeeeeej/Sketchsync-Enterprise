"use client";

import {
  MousePointer2,
  Square,
  Circle,
  Pencil,
  Wifi,
  CheckCircle2,
} from "lucide-react";

export function AuthPreviewCard({ isSignIn }: { isSignIn: boolean }) {
  return (
    <div className="auth-right hidden lg:flex flex-col justify-center relative pointer-events-none select-none">
      <div className="relative rounded-3xl bg-white border border-stone-200/90 shadow-[0_24px_80px_rgba(15,23,42,0.1)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            sketchsync.app/live
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            <Wifi size={11} /> Live
          </span>
        </div>

        <div
          className="relative h-64 bg-[#fcfcfb] p-6"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d4d0cb 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 p-1 bg-white border border-stone-200 rounded-full shadow-sm">
            <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center">
              <MousePointer2 size={11} />
            </div>
            <div className="w-6 h-6 rounded-full text-stone-400 flex items-center justify-center">
              <Square size={11} />
            </div>
            <div className="w-6 h-6 rounded-full text-stone-400 flex items-center justify-center">
              <Circle size={11} />
            </div>
            <div className="w-6 h-6 rounded-full text-stone-400 flex items-center justify-center">
              <Pencil size={11} />
            </div>
          </div>

          <div className="absolute top-[35%] left-[10%] w-[50%] h-[45%] rounded-xl border-2 border-dashed border-[#2563eb]/35 bg-white p-3 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#2563eb]">
              Brainstorm
            </span>
            <div className="space-y-1.5">
              <div className="h-1.5 w-full bg-stone-100 rounded-full" />
              <div className="h-1.5 w-3/4 bg-stone-100 rounded-full" />
            </div>
          </div>

          <div className="absolute top-[22%] right-[12%] w-16 h-16 rounded-full border-2 border-[#e85d4c]/40 bg-white shadow-sm" />

          <div className="absolute bottom-[20%] right-[22%] flex items-center gap-1 bg-[#2563eb] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
            <MousePointer2 size={10} className="-rotate-12 fill-white" />
            <span>You</span>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-3 px-2">
        <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400 mb-4">
          Why teams choose SketchSync
        </h4>
        {[
          "Infinite collaborative canvas with sub-20ms latency",
          "Zero setup — share a room link and start sketching",
          "Export clean vector PNG drawings anytime",
        ].map((feature, idx) => (
          <div key={idx} className="flex items-center gap-3 text-stone-600 text-sm font-medium">
            <CheckCircle2 size={16} className="text-[#059669] shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
