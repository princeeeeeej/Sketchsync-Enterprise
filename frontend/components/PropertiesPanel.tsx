import React from "react";
import { ShapeStyles } from "../canvas/types";

export default function PropertiesPanel({
  style,
  shapeType,
  onChange,
}: {
  style: ShapeStyles;
  shapeType: string | null;
  onChange: (style: Partial<ShapeStyles>) => void;
}) {
  const trackPercent = ((style.strokeWidth - 1) / (5 - 1)) * 100;
  const trackPercentOpacity = style.opacity * 100;

  const strokeColors = [
    "#1c1917", "#e85d4c", "#2563eb", "#059669",
    "#d97706", "#7c3aed", "#ec4899", "#78716c",
  ];

  const fillColors = [
    "transparent",
    "#fee2e2", "#fef3c7", "#d1fae5", "#dbeafe",
    "#ede9fe", "#fce7f3", "#f3f4f6", "#1c1917",
  ];

  return (
    <div className="absolute right-6 top-24 bg-white/90 backdrop-blur-xl border border-stone-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.08)] p-4 rounded-2xl z-50 w-56 text-stone-800 flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">Stroke Color</h2>
        <div className="flex flex-wrap gap-2">
          {strokeColors.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ strokeColor: c })}
              className={`w-5 h-5 rounded-full transition-all cursor-pointer ${
                style.strokeColor === c
                  ? "ring-2 ring-stone-900 ring-offset-2 ring-offset-white scale-110"
                  : "hover:scale-110 border border-stone-200"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {(shapeType === "rect" || shapeType === "circle") && (
        <div className="flex flex-col gap-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">Background</h2>
          <div className="flex flex-wrap gap-2">
            {fillColors.map((b) => (
              <button
                key={b}
                onClick={() => onChange({ fillColor: b })}
                className={`w-5 h-5 rounded-full transition-all relative overflow-hidden cursor-pointer ${
                  style.fillColor === b
                    ? "ring-2 ring-stone-900 ring-offset-2 ring-offset-white scale-110"
                    : "hover:scale-110 border border-stone-200"
                }`}
                style={{ backgroundColor: b === "transparent" ? "#f5f5f4" : b }}
              >
                {b === "transparent" && (
                  <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_45%,#ef4444_45%,#ef4444_55%,transparent_55%)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {shapeType !== "text" && (
        <div className="flex flex-col gap-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">Stroke Style</h2>
          <div className="flex gap-2">
            {(["solid", "dashed", "dotted"] as const).map((size) => (
              <button
                key={size}
                onClick={() => onChange({ strokeSize: size })}
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                  style.strokeSize === size
                    ? "bg-stone-900 text-white shadow-sm"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-900"
                }`}
              >
                <div className={`w-4 border-t-2 ${
                  size === "solid" ? "border-solid" : 
                  size === "dashed" ? "border-dashed" : 
                  "border-dotted"
                } border-current`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {shapeType !== "text" && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">Stroke Width</h2>
            <span className="text-[10px] font-mono font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
              {style.strokeWidth}px
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={style.strokeWidth}
            onChange={(e) => onChange({ strokeWidth: Number(e.target.value) })}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
            style={{
              background: `linear-gradient(to right, #1c1917 ${trackPercent}%, #e7e5e4 ${trackPercent}%)`
            }}
          />
        </div>
      )}

      {shapeType === "text" && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">Font Size</h2>
            <span className="text-[10px] font-mono font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
              {style.fontSize ?? 16}px
            </span>
          </div>
          <input
            type="range"
            min={12}
            max={72}
            step={2}
            value={style.fontSize ?? 16}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
            style={{
              background: `linear-gradient(to right, #1c1917 ${((style.fontSize ?? 16) - 12) / (72 - 12) * 100}%, #e7e5e4 ${((style.fontSize ?? 16) - 12) / (72 - 12) * 100}%)`
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">Opacity</h2>
          <span className="text-[10px] font-mono font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
            {Math.round(style.opacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={style.opacity * 100}
          onChange={(e) => onChange({ opacity: Number(e.target.value) / 100 })}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
          style={{
            background: `linear-gradient(to right, #1c1917 ${trackPercentOpacity}%, #e7e5e4 ${trackPercentOpacity}%)`
          }}
        />
      </div>
    </div>
  );
}