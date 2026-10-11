"use client";

import { MousePointer2 } from "lucide-react";

interface CursorBadgeProps {
  name: string;
  color: string;
  className?: string;
  rotate?: boolean;
}

export function CursorBadge({
  name,
  color,
  className,
  rotate,
}: CursorBadgeProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
      <MousePointer2
        size={15}
        className={rotate ? "-rotate-12" : ""}
        style={{ color, fill: color }}
      />
      <span
        className="px-2 py-0.5 text-white text-[10px] font-bold rounded-md shadow-md"
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </div>
  );
}
