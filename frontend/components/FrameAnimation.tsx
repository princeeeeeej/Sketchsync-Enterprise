"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import type { RoomMode } from "@/components/RoomModal";

interface FrameAnimationProps {
  onOpenRoomModal: (mode: RoomMode) => void;
}

const TOTAL_FRAMES = 28;

// One-based frame numbers: 1 = /1.webp, 24 = /24.webp.
const START_FRAME = 1;
const REVEAL_FRAME = 24;

const TIMELINE_DURATION = 1.2;
const CANVAS_BACKGROUND = "#ffffff";

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

function loadFrame(
  frameNumber: number
): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    let decoding = false;

    const settle = (result: HTMLImageElement | null) => {
      if (settled) return;

      settled = true;
      image.onload = null;
      image.onerror = null;
      resolve(result);
    };

    const finishLoading = async () => {
      if (settled || decoding) return;

      if (!image.naturalWidth || !image.naturalHeight) {
        settle(null);
        return;
      }

      decoding = true;

      try {
        await image.decode();
      } catch {
        // Some browsers can reject decode() even when the image is drawable.
      }

      settle(
        image.naturalWidth && image.naturalHeight ? image : null
      );
    };

    image.decoding = "async";
    image.onload = () => void finishLoading();
    image.onerror = () => settle(null);
    image.src = `/${frameNumber}.webp`;

    // Cached images may already be complete.
    if (image.complete) {
      if (image.naturalWidth) {
        void finishLoading();
      } else {
        settle(null);
      }
    }
  });
}

export default function FrameAnimation({
  onOpenRoomModal,
}: FrameAnimationProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;
    const content = contentRef.current;

    if (!section || !canvas || !leftPanel || !rightPanel || !content) {
      return;
    }

    // Alpha-enabled canvas, composited against an explicitly painted
    // white background to prevent transparent pixels flashing black.
    const ctx = canvas.getContext("2d", { alpha: true });

    if (!ctx) return;

    let disposed = false;
    let initialized = false;
    let currentFrame = START_FRAME - 1;
    let lastDrawn = -1;

    let cssWidth = 0;
    let cssHeight = 0;
    let animationContext: gsap.Context | undefined;
    let refreshFrameId = 0;

    const frames: (HTMLImageElement | null)[] = Array(
      TOTAL_FRAMES
    ).fill(null);

    const resizeCanvas = (): boolean => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (!width || !height) {
        cssWidth = width;
        cssHeight = height;
        return false;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);

      const cssChanged =
        width !== cssWidth || height !== cssHeight;

      const pixelChanged =
        canvas.width !== pixelWidth ||
        canvas.height !== pixelHeight;

      cssWidth = width;
      cssHeight = height;

      // Changing canvas dimensions clears its bitmap, so redraw afterwards.
      if (pixelChanged) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        lastDrawn = -1;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      return cssChanged || pixelChanged;
    };

    const drawFrame = (frameNumber: number, force = false) => {
      if (disposed || !cssWidth || !cssHeight) return;

      let index = Math.max(
        0,
        Math.min(TOTAL_FRAMES - 1, Math.round(frameNumber))
      );

      // If an image failed to load, fall back to the nearest
      // available earlier image.
      while (index >= 0 && !frames[index]) {
        index -= 1;
      }

      if (index < 0) {
        ctx.clearRect(0, 0, cssWidth, cssHeight);
        ctx.fillStyle = CANVAS_BACKGROUND;
        ctx.fillRect(0, 0, cssWidth, cssHeight);
        lastDrawn = -1;
        return;
      }

      if (!force && index === lastDrawn) return;

      const image = frames[index];

      if (!image) return;

      const imageWidth = image.naturalWidth;
      const imageHeight = image.naturalHeight;

      if (!imageWidth || !imageHeight) return;

      // Cover the canvas while keeping the image centered.
      const scale = Math.max(
        cssWidth / imageWidth,
        cssHeight / imageHeight
      );

      const drawWidth = imageWidth * scale;
      const drawHeight = imageHeight * scale;

      const offsetX = (cssWidth - drawWidth) / 2;
      const offsetY = (cssHeight - drawHeight) / 2;

      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.fillStyle = CANVAS_BACKGROUND;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      ctx.drawImage(
        image,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight
      );

      lastDrawn = index;
    };

    const initializeAnimation = () => {
      if (disposed || initialized) return;

      const firstAvailable = frames.findIndex(Boolean);

      if (firstAvailable < 0) {
        console.error("SketchSync: no valid animation frames loaded.");
        return;
      }

      const requestedStartIndex = START_FRAME - 1;

      const startIndex = frames[requestedStartIndex]
        ? requestedStartIndex
        : firstAvailable;

      const lastAvailable = frames.reduce(
        (last, frame, index) => (frame ? index : last),
        -1
      );

      if (lastAvailable <= startIndex) {
        console.error(
          "SketchSync: not enough valid frames to animate."
        );
        return;
      }

      initialized = true;
      currentFrame = startIndex;

      resizeCanvas();
      drawFrame(currentFrame, true);

      const requestedRevealIndex = REVEAL_FRAME - 1;

      const revealIndex = Math.min(
        lastAvailable,
        Math.max(startIndex + 1, requestedRevealIndex)
      );

      const revealAt =
        (revealIndex - startIndex) /
        (lastAvailable - startIndex);

      // Timeline times are proportional to the frame sequence.
      // All reveal animations finish by the final frame.
      const revealTime = revealAt * TIMELINE_DURATION;

      const panelDuration = Math.min(
        0.09,
        TIMELINE_DURATION - revealTime
      );

      const contentStart = Math.min(
        revealTime + panelDuration * 0.7,
        TIMELINE_DURATION
      );

      const contentDuration = Math.max(
        0.001,
        Math.min(0.18, TIMELINE_DURATION - contentStart)
      );

      animationContext = gsap.context(() => {
        gsap.set(leftPanel, {
          xPercent: -101,
          autoAlpha: 1,
        });

        gsap.set(rightPanel, {
          xPercent: 101,
          autoAlpha: 1,
        });

        // Start fully hidden above the reveal mask.
        gsap.set(content, {
          autoAlpha: 0,
          y: 36,
          scale: 0.97,
          clipPath: "inset(0 0 100% 0)",
          transformOrigin: "center center",
        });

        const playhead = { frame: startIndex };

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () =>
              `+=${Math.round(window.innerHeight * 1.4)}`,
            pin: true,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        });

        // Frame-by-frame animation.
        timeline.to(
          playhead,
          {
            frame: lastAvailable,
            duration: TIMELINE_DURATION,
            ease: "none",
            onUpdate: () => {
              currentFrame = playhead.frame;
              drawFrame(currentFrame);
            },
          },
          0
        );

        // Blue panels slide towards each other.
        timeline.to(
          leftPanel,
          {
            xPercent: 0,
            duration: panelDuration,
            ease: "power2.inOut",
          },
          revealTime
        );

        timeline.to(
          rightPanel,
          {
            xPercent: 0,
            duration: panelDuration,
            ease: "power2.inOut",
          },
          revealTime
        );

        // Features use a combined wipe, vertical movement and scale.
        // All headings and rows animate together rather than staggering.
        timeline.to(
          content,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            clipPath: "inset(0 0 0% 0)",
            duration: contentDuration,
            ease: "power3.out",
          },
          contentStart
        );
      }, section);

      // Refresh once after images and the pinned timeline are ready.
      refreshFrameId = requestAnimationFrame(() => {
        if (!disposed) {
          ScrollTrigger.refresh();
        }
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      if (resizeCanvas()) {
        drawFrame(currentFrame, true);
      }
    });

    resizeObserver.observe(canvas);

    const preloadFrames = async () => {
      const loadedFrames = await Promise.all(
        Array.from({ length: TOTAL_FRAMES }, (_, index) =>
          loadFrame(index + 1)
        )
      );

      if (disposed) return;

      loadedFrames.forEach((image, index) => {
        frames[index] = image;
      });

      initializeAnimation();
    };

    void preloadFrames();

    return () => {
      disposed = true;

      cancelAnimationFrame(refreshFrameId);
      resizeObserver.disconnect();

      // Revert timeline styles and remove the associated ScrollTrigger.
      animationContext?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-0 h-[100svh] min-h-[680px] w-full overflow-hidden bg-white text-white"
      aria-label="SketchSync animation and features"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 block h-full w-full bg-white"
        aria-hidden="true"
      />

      {/* Blue transition panels */}
      <div
        ref={leftPanelRef}
        className="invisible absolute inset-y-0 left-0 z-10 w-[50.5%] bg-[#0038FF]"
        aria-hidden="true"
      />

      <div
        ref={rightPanelRef}
        className="invisible absolute inset-y-0 right-0 z-10 w-[50.5%] bg-[#0038FF]"
        aria-hidden="true"
      />

      {/* Features content */}
      <div
        ref={contentRef}
        className="invisible absolute inset-0 z-20"
      >
        <div className="mx-auto grid h-full w-full max-w-[1400px] grid-cols-1 content-center gap-6 px-5 pb-6 pt-24 sm:px-10 lg:grid-cols-2 lg:content-stretch lg:gap-x-[6%] lg:px-[6.7%] lg:pb-10 lg:pt-28">
          {/* Left column */}
          <div className="flex min-h-0 flex-col justify-between">
            <div>
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white/70 sm:text-xs lg:mb-6">
                SketchSync / Features
              </p>

              <h2 className="text-[clamp(2rem,min(4.2vw,8svh),4.75rem)] font-medium leading-[0.98] tracking-[-0.065em]">
                Everything starts
                <br />
                with an{" "}
                <span className="font-serif italic">idea.</span>
              </h2>
            </div>

            <div className="hidden lg:block">
              <p className="mb-5 text-sm text-white/70">
                One canvas. Many minds. Endless possibilities.
              </p>

              <button
                type="button"
                onClick={() => onOpenRoomModal("create")}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white px-4 py-2.5 text-sm transition-colors hover:bg-white hover:text-[#1747FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1747FF]"
              >
                Start sketching{" "}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          {/* Right column: all four features */}
          <div className="flex min-h-0 flex-col">
            <div className="flex flex-col border-t border-white/40 lg:h-full">
              {features.map((feature) => (
                <article
                  key={feature.number}
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)] content-center items-baseline gap-x-3 border-b border-white/40 py-3 sm:py-4 lg:min-h-0 lg:flex-1 lg:py-0"
                >
                  <span className="text-xs text-white/65">
                    {feature.number}
                  </span>

                  <h3 className="text-xl font-semibold tracking-[-0.045em] sm:text-2xl lg:text-[clamp(1.4rem,min(2.4vw,4svh),2.1rem)]">
                    {feature.title}
                  </h3>

                  <p className="col-start-2 mt-1.5 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onOpenRoomModal("create")}
              className="mt-5 inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-white px-4 py-2.5 text-sm transition-colors hover:bg-white hover:text-[#1747FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1747FF] lg:hidden"
            >
              Start sketching{" "}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}