"use client";

import type { LucideIcon } from "lucide-react";
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Pencil,
  Minus,
  Undo2,
  Redo2,
  Trash2,
  Hand,
  Download,
  Eraser,
} from "lucide-react";

import type { Tool } from "../canvas/types";

interface ToolButtonProps {
  Icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolButton({
  Icon,
  label,
  active = false,
  disabled = false,
  onClick,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`
        group relative flex h-10 w-10 shrink-0
        items-center justify-center rounded-xl
        border
        transition-all duration-200 ease-out
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#1747FF]/40
        focus-visible:ring-offset-2

        ${
          disabled
            ? "cursor-not-allowed border-transparent text-slate-300 opacity-40"
            : active
              ? "cursor-pointer border-[#1747FF] bg-[#1747FF] text-white shadow-md shadow-[#1747FF]/20"
              : "cursor-pointer border-transparent bg-transparent text-slate-600 hover:border-[#E1EAFF] hover:bg-[#E1EAFF] hover:text-bg-slate-200 hover:shadow-md hover:shadow-[#E1EAFF]/20 active:scale-95"
        }
      `}
    >
      <Icon
        size={14}
        strokeWidth={1.8}
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      />
    </button>
  );
}

function ToolbarDivider() {
  return (
    <div
      aria-hidden="true"
      className="mx-1.5 h-5 w-px shrink-0 bg-slate-200"
    />
  );
}

interface ToolBarProps {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onDownload: () => void;
}

export const ToolBar = ({
  selectedTool,
  setSelectedTool,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onClear,
  onDownload,
}: ToolBarProps) => {
  return (
    <div className="fixed left-1/2 top-3 z-50 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2">
      <div
        role="toolbar"
        aria-label="SketchSync canvas tools"
        className="
          flex max-w-full items-center gap-0.5
          overflow-x-auto rounded-2xl
          border border-slate-200/80
          bg-white/95 p-1.5
          shadow-[0_8px_30px_rgba(15,23,42,0.08)]
          backdrop-blur-xl
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {/* Navigation tools */}
        <ToolButton
          Icon={MousePointer2}
          label="Select"
          active={selectedTool === "pointer"}
          onClick={() => setSelectedTool("pointer")}
        />

        <ToolButton
          Icon={Hand}
          label="Pan canvas"
          active={selectedTool === "hand"}
          onClick={() => setSelectedTool("hand")}
        />

        <ToolbarDivider />

        {/* Drawing tools */}
        <ToolButton
          Icon={Square}
          label="Rectangle"
          active={selectedTool === "rect"}
          onClick={() => setSelectedTool("rect")}
        />

        <ToolButton
          Icon={Circle}
          label="Circle"
          active={selectedTool === "circle"}
          onClick={() => setSelectedTool("circle")}
        />

        <ToolButton
          Icon={Minus}
          label="Line"
          active={selectedTool === "line"}
          onClick={() => setSelectedTool("line")}
        />

        <ToolButton
          Icon={Pencil}
          label="Freehand draw"
          active={selectedTool === "pen"}
          onClick={() => setSelectedTool("pen")}
        />

        <ToolButton
          Icon={Type}
          label="Text"
          active={selectedTool === "text"}
          onClick={() => setSelectedTool("text")}
        />

        <ToolButton
          Icon={Eraser}
          label="Eraser"
          active={selectedTool === "eraser"}
          onClick={() => setSelectedTool("eraser")}
        />

        <ToolbarDivider />

        {/* Undo and redo */}
        <ToolButton
          Icon={Undo2}
          label="Undo"
          disabled={!canUndo}
          onClick={onUndo}
        />

        <ToolButton
          Icon={Redo2}
          label="Redo"
          disabled={!canRedo}
          onClick={onRedo}
        />

        <ToolbarDivider />

        {/* Canvas actions */}
        <ToolButton
          Icon={Trash2}
          label="Clear canvas"
          onClick={onClear}
        />

        {/* Export */}
        <button
          type="button"
          title="Export canvas as PNG"
          aria-label="Export canvas as PNG"
          onClick={onDownload}
          className="
            group ml-1 inline-flex h-10 shrink-0
            cursor-pointer items-center justify-center gap-2
            rounded-xl border border-[#1747FF]
            bg-white px-3
            text-xs font-semibold text-[#1747FF]
            transition-all duration-200 ease-out
            hover:bg-[#1747FF] hover:text-white
            hover:shadow-md hover:shadow-[#1747FF]/20
            active:scale-95
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#1747FF]/40
            focus-visible:ring-offset-2
          "
        >
          <Download
            size={14}
            strokeWidth={1.8}
            className="shrink-0 transition-transform duration-200 group-hover:scale-105"
          />

          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </div>
  );
};