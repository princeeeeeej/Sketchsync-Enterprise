"use client";

import Link from "next/link";
import CurrentYear from "./CurrentYear";

import type { RoomMode } from "@/components/RoomModal";

interface FinalCTAProps {
  onOpenRoomModal: (mode: RoomMode) => void;
}

function SketchSyncMark() {
  const diamond =
    "absolute h-[43%] w-[43%] rotate-45 rounded-[24%] border-[8px] border-[#DCE3FF]/80 sm:border-[12px]";

  return (
    <div
      className="relative h-28 w-28 shrink-0 sm:h-40 sm:w-40"
      aria-hidden="true"
    >
      <div className={`${diamond} left-1/2 top-0 -translate-x-1/2`} />
      <div className={`${diamond} bottom-0 left-1/2 -translate-x-1/2`} />
      <div className={`${diamond} left-0 top-1/2 -translate-y-1/2`} />
      <div className={`${diamond} right-0 top-1/2 -translate-y-1/2`} />
    </div>
  );
}

export default function FinalCTA({
  onOpenRoomModal,
}: FinalCTAProps) {
  return (
    <footer className="relative z-10 overflow-hidden bg-[#0038FF] text-[#DCE3FF]">
      {/* Main CTA */}
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 pt-16 sm:px-10 sm:pt-20 lg:flex-row lg:items-center lg:justify-between lg:px-[6.7%]">
        <div className="flex items-center gap-6 sm:gap-10">
          <SketchSyncMark />

          <div>
            <p className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl">
              Have an idea?
              <br />
              Let&apos;s make it real.
            </p>

            <p className="mt-3 text-sm text-[#DCE3FF]/80 sm:text-base">
              One canvas, together.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/docs"
            className="
              rounded-xl border border-[#DCE3FF]/70
              px-6 py-3 text-sm font-semibold
              transition-colors
              hover:bg-[#DCE3FF] hover:text-[#0038FF]
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-white
              focus-visible:ring-offset-2
              focus-visible:ring-offset-[#0038FF]
              sm:px-8
            "
          >
            Read docs
          </Link>

          <button
            type="button"
            onClick={() => onOpenRoomModal("create")}
            className="
              cursor-pointer rounded-xl
              bg-[#DCE3FF] px-6 py-3
              text-sm font-semibold text-[#0038FF]
              transition-colors duration-200
              hover:bg-white
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-white
              focus-visible:ring-offset-2
              focus-visible:ring-offset-[#0038FF]
              sm:px-8
            "
          >
            Start creating ↗
          </button>
        </div>
      </div>

      {/* Large wordmark */}
      <div className="mt-10 select-none overflow-hidden pl-[2.5vw] pr-[1vw] sm:mt-14">
        <p
          aria-label="Let's sketch."
          className="whitespace-nowrap pb-[0.06em] text-[17.5vw] font-semibold italic leading-[1] tracking-[-0.07em] text-[#DCE3FF]"
        >
          let&apos;s sketch.
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-[#DCE3FF]/20">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 py-4 text-xs text-[#DCE3FF]/70 sm:px-10 lg:px-[6.7%]">
          <span>
            © <CurrentYear /> SketchSync
          </span>

          <Link
            href="/docs"
            className="transition-opacity hover:opacity-70"
          >
            Docs
          </Link>
        </div>
      </div>
    </footer>
  );
}