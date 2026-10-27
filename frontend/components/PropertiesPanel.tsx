"use client";

import React from "react";
import type { ShapeStyles } from "../canvas/types";

const BLUE = "#1747FF";

const STROKE_COLORS = [
  "#080808",
  "#e85d4c",
  BLUE,
  "#059669",
  "#d97706",
  "#7c3aed",
  "#ec4899",
  "#78716c",
];

const FILL_COLORS = [
  "transparent",
  "#fee2e2",
  "#fef3c7",
  "#d1fae5",
  "#dbeafe",
  "#ede9fe",
  "#fce7f3",
  "#f3f4f6",
  "#080808",
];

const labelClass =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500";

const valueClass =
  "border border-[#DCE5FF] bg-[#EEF3FF] px-1.5 py-1 " +
  "text-[10px] font-semibold tabular-nums text-[#1747FF]";

const sliderClass = `
  h-1 w-full cursor-pointer appearance-none
  bg-transparent
  focus-visible:outline-none
  focus-visible:ring-2 focus-visible:ring-[#1747FF]/30
  focus-visible:ring-offset-4 focus-visible:ring-offset-white

  [&::-webkit-slider-thumb]:h-3
  [&::-webkit-slider-thumb]:w-3
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:border-2
  [&::-webkit-slider-thumb]:border-white
  [&::-webkit-slider-thumb]:bg-[#1747FF]
  [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_#1747FF]
  [&::-webkit-slider-thumb]:transition-transform
  [&::-webkit-slider-thumb]:duration-150
  [&::-webkit-slider-thumb]:ease-out
  [&::-webkit-slider-thumb]:hover:scale-125

  [&::-moz-range-thumb]:h-2
  [&::-moz-range-thumb]:w-2
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:border-2
  [&::-moz-range-thumb]:border-white
  [&::-moz-range-thumb]:bg-[#1747FF]
  [&::-moz-range-thumb]:shadow-[0_0_0_1px_#1747FF]
  [&::-moz-range-thumb]:transition-transform
  [&::-moz-range-thumb]:duration-150
  [&::-moz-range-thumb]:ease-out

  [&::-moz-range-progress]:bg-[#1747FF]
`;

function getSliderBackground(percent: number) {
  const safePercent = Math.max(0, Math.min(100, percent));

  return {
    background: `linear-gradient(
      to right,
      ${BLUE} 0%,
      ${BLUE} ${safePercent}%,
      #e2e8f0 ${safePercent}%,
      #e2e8f0 100%
    )`,
  };
}

function formatPixels(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function ColorSwatch({
  color,
  selected,
  label,
  transparent = false,
  onClick,
}: {
  color: string;
  selected: boolean;
  label: string;
  transparent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={`
        relative h-5 w-5 shrink-0 cursor-pointer
        overflow-hidden rounded-[6px] border
        transition-[transform,border-color,box-shadow]
        duration-150 ease-out
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#1747FF]/50
        focus-visible:ring-offset-2
        ${
          selected
            ? "z-10 scale-110 border-white ring-2 ring-[#1747FF] ring-offset-1 ring-offset-white"
            : "border-slate-200 hover:scale-110 hover:border-slate-400"
        }
      `}
      style={{
        backgroundColor: transparent ? "#f8fafc" : color,
      }}
    >
      {transparent && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0
            bg-[linear-gradient(45deg,transparent_45%,#ef4444_45%,#ef4444_55%,transparent_55%)]
          "
        />
      )}
    </button>
  );
}

export default function PropertiesPanel({
  style,
  shapeType,
  onChange,
}: {
  style: ShapeStyles;
  shapeType: string | null;
  onChange: (style: Partial<ShapeStyles>) => void;
}) {
  const strokeWidthPercent =
    ((style.strokeWidth - 1) / 4) * 100;

  const opacityPercent = style.opacity * 100;

  const fontSize = style.fontSize ?? 16;
  const fontSizePercent = ((fontSize - 12) / 60) * 100;

  return (
    <aside
      aria-label="Shape properties"
      style={{ fontFamily: "inherit" }}
      className="
        absolute right-4 top-20 z-50
        flex max-h-[calc(100%-6rem)] w-60
        flex-col gap-5 overflow-y-auto
        border border-slate-200/90
        bg-white/95 p-4 text-[#080808]
        shadow-[0_8px_28px_rgba(15,23,42,0.07)]
        backdrop-blur-xl
        antialiased
        rounded-[15px]
      "
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <h2 className="text-[13px] font-semibold tracking-[-0.045em]">
          Properties
        </h2>

        <span
          className="
            border border-[#DCE5FF]
            bg-[#EEF3FF] px-1.5 py-1
            text-[9px] font-semibold
            uppercase tracking-[0.12em]
            text-[#1747FF]
          "
        >
          Style
        </span>
      </header>

      {/* Stroke color */}
      <section className="flex flex-col gap-3">
        <h3 className={labelClass}>Stroke color</h3>

        <div className="flex flex-wrap gap-3">
          {STROKE_COLORS.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              label={`Stroke color ${color}`}
              selected={style.strokeColor === color}
              onClick={() => onChange({ strokeColor: color })}
            />
          ))}
        </div>
      </section>

      {/* Fill color */}
      {(shapeType === "rect" || shapeType === "circle") && (
        <section className="flex flex-col gap-3">
          <h3 className={labelClass}>Background</h3>

          <div className="flex flex-wrap gap-3">
            {FILL_COLORS.map((color) => {
              const transparent = color === "transparent";

              return (
                <ColorSwatch
                  key={color}
                  color={color}
                  label={transparent ? "No fill" : `Fill color ${color}`}
                  selected={style.fillColor === color}
                  transparent={transparent}
                  onClick={() => onChange({ fillColor: color })}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Stroke style */}
      {shapeType !== "text" && (
        <section className="flex flex-col gap-3">
          <h3 className={labelClass}>Stroke style</h3>

          <div className="grid grid-cols-3 gap-1.5">
            {(["solid", "dashed", "dotted"] as const).map((size) => {
              const selected = style.strokeSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  title={`${size} stroke`}
                  aria-label={`${size} stroke`}
                  aria-pressed={selected}
                  onClick={() => onChange({ strokeSize: size })}
                  className={`
                    flex h-8 cursor-pointer items-center
                    justify-center rounded-[6px] border
                    transition-[background-color,border-color,color]
                    duration-150 ease-out
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#1747FF]/40
                    ${
                      selected
                        ? "border-[#1747FF] bg-[#1747FF] text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-[#1747FF]/50 hover:bg-[#EEF3FF] hover:text-[#1747FF]"
                    }
                  `}
                >
                  <span
                    className={`
                      w-5 border-t-2 border-current
                      ${
                        size === "solid"
                          ? "border-solid"
                          : size === "dashed"
                            ? "border-dashed"
                            : "border-dotted"
                      }
                    `}
                  />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Stroke width */}
      {shapeType !== "text" && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className={labelClass}>Stroke width</h3>

            <span className={valueClass}>
              {formatPixels(style.strokeWidth)}px
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={5}
            step={0.5}
            value={style.strokeWidth}
            aria-label="Stroke width"
            onChange={(e) =>
              onChange({
                strokeWidth: Number(e.target.value),
              })
            }
            className={sliderClass}
            style={getSliderBackground(strokeWidthPercent)}
          />

          <div className="flex justify-between text-[10px] font-medium tracking-tight text-slate-400">
            <span>Thin</span>
            <span>Thick</span>
          </div>
        </section>
      )}

      {/* Font size */}
      {shapeType === "text" && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className={labelClass}>Font size</h3>

            <span className={valueClass}>{fontSize}px</span>
          </div>

          <input
            type="range"
            min={12}
            max={72}
            step={2}
            value={fontSize}
            aria-label="Font size"
            onChange={(e) =>
              onChange({
                fontSize: Number(e.target.value),
              })
            }
            className={sliderClass}
            style={getSliderBackground(fontSizePercent)}
          />

          <div className="flex justify-between text-[10px] font-medium tracking-tight text-slate-400">
            <span>12px</span>
            <span>72px</span>
          </div>
        </section>
      )}

      {/* Opacity */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className={labelClass}>Opacity</h3>

          <span className={valueClass}>
            {Math.round(opacityPercent)}%
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={opacityPercent}
          aria-label="Opacity"
          onChange={(e) =>
            onChange({
              opacity: Number(e.target.value) / 100,
            })
          }
          className={sliderClass}
          style={getSliderBackground(opacityPercent)}
        />
      </section>
    </aside>
  );
}