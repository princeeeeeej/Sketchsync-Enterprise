"use client";

import { useEffect, useRef, useCallback } from "react";

const INK_COLORS = ["#1c1917", "#e85d4c", "#2563eb", "#059669", "#d97706", "#7c3aed"];

const CURSOR_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22'%3E%3Ccircle cx='11' cy='11' r='8' fill='none' stroke='%231c1917' stroke-width='2'/%3E%3Ccircle cx='11' cy='11' r='2' fill='%231c1917'/%3E%3Cline x1='11' y1='0' x2='11' y2='5' stroke='%231c1917' stroke-width='1.5' stroke-linecap='round'/%3E%3Cline x1='11' y1='17' x2='11' y2='22' stroke='%231c1917' stroke-width='1.5' stroke-linecap='round'/%3E%3Cline x1='0' y1='11' x2='5' y2='11' stroke='%231c1917' stroke-width='1.5' stroke-linecap='round'/%3E%3Cline x1='17' y1='11' x2='22' y2='11' stroke='%231c1917' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") 11 11, crosshair`;

const MIN_DRAW_DISTANCE = 2;
const STROKE_WIDTH = 3;
const STROKE_ALPHA = 0.85;

interface Point {
  x: number;
  y: number;
}

interface StrokePath {
  color: string;
  width: number;
  points: Point[];
}

interface DrawCanvasProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;

  const interactiveTags = ["BUTTON", "INPUT", "A", "TEXTAREA", "SELECT", "LABEL"];
  if (interactiveTags.includes(el.tagName)) return true;

  return !!(
    el.closest("button") ||
    el.closest("a") ||
    el.closest("input") ||
    el.closest("textarea") ||
    el.closest("[role='button']")
  );
}

function getClientCoords(e: MouseEvent | TouchEvent): Point | null {
  if ("touches" in e) {
    const touch = e.touches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
}

function isInsideRect(x: number, y: number, rect: DOMRect): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function pickRandomColor(): string {
  return INK_COLORS[Math.floor(Math.random() * INK_COLORS.length)]!;
}

export default function DrawCanvas({ containerRef }: DrawCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentPath = useRef<StrokePath | null>(null);
  const pathsRef = useRef<StrokePath[]>([]);
  const strokeColor = useRef(INK_COLORS[0]!);
  const rafId = useRef<number | null>(null);
  const needsRedraw = useRef(false);

  const toCanvasCoords = useCallback(
    (clientX: number, clientY: number): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: clientX, y: clientY };
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderPath = (path: StrokePath) => {
      if (path.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = STROKE_ALPHA;

      ctx.moveTo(path.points[0]!.x, path.points[0]!.y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i]!.x, path.points[i]!.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const redrawAll = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const path of pathsRef.current) {
        renderPath(path);
      }
      if (currentPath.current) {
        renderPath(currentPath.current);
      }
    };

    const renderLoop = () => {
      if (needsRedraw.current) {
        redrawAll();
        needsRedraw.current = false;
      }
      rafId.current = requestAnimationFrame(renderLoop);
    };
    rafId.current = requestAnimationFrame(renderLoop);

    const updateCanvasSize = () => {
      let w: number;
      let h: number;

      if (containerRef?.current) {
        w = containerRef.current.offsetWidth;
        h = containerRef.current.offsetHeight;
      } else {
        w = window.innerWidth;
        h = window.innerHeight;
      }

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        needsRedraw.current = true;
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const resizeObserver = new ResizeObserver(() => updateCanvasSize());
    if (containerRef?.current) {
      resizeObserver.observe(containerRef.current);
    } else {
      resizeObserver.observe(document.body);
    }

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if ("button" in e && e.button !== 0) return;
      if (isInteractiveTarget(e.target)) return;

      const coords = getClientCoords(e);
      if (!coords) return;

      if (containerRef?.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        if (!isInsideRect(coords.x, coords.y, containerRect)) return;
      }

      const point = toCanvasCoords(coords.x, coords.y);
      strokeColor.current = pickRandomColor();
      isDrawing.current = true;
      window.getSelection()?.removeAllRanges();
      document.body.classList.add("select-none");

      currentPath.current = {
        color: strokeColor.current,
        width: STROKE_WIDTH,
        points: [point],
      };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current || !currentPath.current) return;
      window.getSelection()?.removeAllRanges();

      const coords = getClientCoords(e);
      if (!coords) return;

      const point = toCanvasCoords(coords.x, coords.y);

      const lastPoint = currentPath.current.points[currentPath.current.points.length - 1];
      if (lastPoint) {
        const dx = point.x - lastPoint.x;
        const dy = point.y - lastPoint.y;
        if (Math.sqrt(dx * dx + dy * dy) < MIN_DRAW_DISTANCE) return;
      }

      currentPath.current.points.push(point);
      needsRedraw.current = true;
    };

    const handlePointerUp = () => {
      document.body.classList.remove("select-none");
      if (isDrawing.current && currentPath.current && currentPath.current.points.length > 1) {
        pathsRef.current.push(currentPath.current);
      }
      isDrawing.current = false;
      currentPath.current = null;
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    window.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      window.removeEventListener("resize", updateCanvasSize);
      resizeObserver.disconnect();

      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [toCanvasCoords, containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 z-[5] pointer-events-none touch-none"
      style={{
        width: "100%",
        height: "100%",
        cursor: CURSOR_SVG,
      }}
      aria-hidden="true"
    />
  );
}
