"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const features = [
  {
    number: "01",
    title: "Draw together",
    description:
      "A shared canvas where sketches, diagrams, and spontaneous ideas come together.",
  },
  {
    number: "02",
    title: "Create in real time",
    description:
      "See every stroke as it happens and collaborate naturally without passing files around.",
  },
  {
    number: "03",
    title: "Think visually",
    description:
      "Turn abstract thoughts into visual ideas, map concepts, and simplify complex problems.",
  },
  {
    number: "04",
    title: "Share the moment",
    description:
      "Create a room, invite your team, and build something together from anywhere.",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const items = section.querySelectorAll(".features-reveal");
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      gsap.fromTo(
        items,
        { autoAlpha: 0, y: reduceMotion ? 0 : 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: reduceMotion ? 0.01 : 0.7,
          stagger: reduceMotion ? 0 : 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative z-10 scroll-mt-0 bg-[#0038FF] text-white"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-24 sm:px-10 sm:py-28 lg:grid-cols-2 lg:gap-x-[6%] lg:px-[6.7%] lg:py-32">
        {/* Left: stays in view while rows scroll on desktop */}
        <div className="features-reveal invisible lg:sticky lg:top-32 lg:self-start">
          <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/70 sm:text-xs">
            SketchSync / Features
          </p>

          <h2 className="text-[clamp(2.5rem,5.5vw,5rem)] font-medium leading-[0.98] tracking-[-0.065em]">
            Everything starts
            <br />
            with an <span className="font-serif italic">idea.</span>
          </h2>

          <p className="mt-6 text-sm text-white/70 sm:text-base">
            One canvas. Many minds. Endless possibilities.
          </p>

          <a
            href="/rooms/create"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white px-4 py-2.5 text-sm transition-colors hover:bg-white hover:text-[#1747FF]"
          >
            Start sketching <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Right: feature rows */}
        <div className="border-t border-white/40">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="features-reveal invisible grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3 border-b border-white/40 py-8 sm:py-10 lg:py-12"
            >
              <span className="text-xs text-white/65">{feature.number}</span>

              <h3 className="text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">
                {feature.title}
              </h3>

              <p className="col-start-2 mt-2 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}