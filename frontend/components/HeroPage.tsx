"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";

import type { RoomMode } from "@/components/RoomModal";

interface HeroPageProps {
  onOpenRoomModal: (mode: RoomMode) => void;
}

export default function HeroPage({
  onOpenRoomModal,
}: HeroPageProps) {
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const content = contentRef.current;

    if (!hero || !content) return;

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const lines = content.querySelectorAll(".hero-line");

      gsap.set(lines, {
        autoAlpha: reduceMotion ? 1 : 0,
        y: reduceMotion ? 0 : 22,
      });

      gsap.to(lines, {
        autoAlpha: 1,
        y: 0,
        duration: reduceMotion ? 0.01 : 0.7,
        stagger: reduceMotion ? 0 : 0.1,
        ease: "power3.out",
        delay: reduceMotion ? 0 : 0.2,
      });
    }, hero);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="
        relative z-30 min-h-[100svh] w-full
        overflow-hidden bg-white
      "
    >
      <div
        className="
          mx-auto grid min-h-[100svh] w-full max-w-[1400px]
          grid-cols-1 items-end gap-8
          px-5 pt-28 pb-16
          sm:px-10 sm:pb-20
          md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]
          md:gap-8
          lg:gap-10 lg:px-[6.7%] lg:pb-24
        "
      >
        {/* LEFT: Hero text and CTA */}
        <div
          ref={contentRef}
          className="
            relative z-30 w-full min-w-0
            pb-4 md:pb-0
          "
        >
          <div className="w-full min-w-0 max-w-[780px]">
            <h1
              className="
                font-normal leading-[1.02]
                tracking-[-0.065em] text-[#080808]
              "
            >
              <span
                className="
                  hero-line block max-w-full
                  text-[2.8rem] font-semibold
                  leading-[1.05] tracking-[-0.065em]
                  sm:text-[3.5rem]
                  md:text-[clamp(2.3rem,3.3vw,3.5rem)]
                  lg:text-[clamp(2.5rem,3.5vw,3.8rem)]
                "
              >
                Good ideas don&apos;t{" "}
                <span
                  className="
                    font-serif font-bold italic
                    tracking-[-0.06em] text-[#1747FF]
                  "
                >
                  draw
                </span>{" "}
                themselves.
              </span>

              <span
                className="
                  hero-line mt-4 block w-full max-w-[650px]
                  text-[1.15rem] font-normal
                  leading-[1.35] tracking-[-0.035em]
                  text-[#555555]
                  sm:text-xl
                  md:text-[1.25rem]
                  lg:text-[clamp(1.3rem,1.7vw,1.65rem)]
                "
              >
                Bring your people and turn a blank canvas into something
                brilliant.
              </span>

              {/* CTA opens the shared room modal */}
              <span
                className="
                  hero-line relative z-30 mt-6
                  flex w-full flex-wrap
                  items-center gap-x-4
                  pointer-events-auto
                "
              >
                <button
                  type="button"
                  onClick={() => onOpenRoomModal("create")}
                  className="
                    group relative z-30 inline-flex shrink-0
                    cursor-pointer items-center gap-2
                    rounded-[9px] border-2
                    border-[#1747FF] px-3.5 py-2.5
                    text-lg font-normal
                    tracking-[-0.055em]
                    text-[#1747FF]
                    transition-colors duration-200
                    hover:bg-[#1747FF] hover:text-white
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#1747FF]
                    focus-visible:ring-offset-2
                    sm:text-xl
                  "
                >
                  Let&apos;s sketch

                  <ArrowRight
                    size={19}
                    aria-hidden="true"
                    className="
                      shrink-0 transition-transform
                      duration-200
                      group-hover:translate-x-1
                    "
                  />
                </button>
              </span>
            </h1>
          </div>
        </div>

        {/* RIGHT: Image in its own column */}
        <div
          className="
            relative z-10 flex w-full min-w-0
            items-end justify-center
            md:h-[78svh] md:min-h-[500px]
            md:justify-end
          "
        >
          <img
            src="/sketchsync.webp"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="
              block h-auto w-full max-w-[400px]
              select-none object-contain object-bottom
              md:max-h-[680px] md:max-w-[440px]
            "
          />
        </div>
      </div>
    </section>
  );
}