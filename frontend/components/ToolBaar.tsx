"use client";

import React, { cloneElement } from "react";
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
  Eraser
} from "lucide-react";

interface ToolButtonProps {
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
}

const ToolButton = ({ icon, active, disabled, onClick, label }: ToolButtonProps) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    title={label}
    className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150
      ${disabled 
        ? "text-stone-300 cursor-not-allowed opacity-40"
        : active 
          ? "bg-stone-900 text-white shadow-sm scale-105 cursor-pointer"
          : "text-stone-500 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
      }`}
  >
    {cloneElement(icon as React.ReactElement<{ size?: number; strokeWidth?: number }>, { size: 16, strokeWidth: 1.75 })}
  </button>
);

interface ToolBarProps {
  selectedTool: string;
  setSelectedTool: (tool: any) => void;
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
  onDownload
}: ToolBarProps) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center p-1.5 bg-white/90 backdrop-blur-xl border border-stone-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.08)] rounded-full">
        <ToolButton 
          label="Select"
          icon={<MousePointer2 />} 
          active={selectedTool === "pointer"} 
          onClick={() => setSelectedTool("pointer")} 
        />
        <ToolButton label="Pan Hand" icon={<Hand />} active={selectedTool === "hand"} onClick={() => setSelectedTool("hand")} />
        <div className="w-[1px] h-4 bg-stone-200 mx-1.5" />
        <ToolButton label="Rectangle" icon={<Square />} active={selectedTool === "rect"} onClick={() => setSelectedTool("rect")} />
        <ToolButton label="Circle" icon={<Circle />} active={selectedTool === "circle"} onClick={() => setSelectedTool("circle")} />
        <ToolButton label="Line" icon={<Minus />} active={selectedTool === "line"} onClick={() => setSelectedTool("line")} />
        <ToolButton label="Draw" icon={<Pencil />} active={selectedTool === "pen"} onClick={() => setSelectedTool("pen")} />
        <ToolButton label="Text" icon={<Type />} active={selectedTool === "text"} onClick={() => setSelectedTool("text")} />
        <ToolButton label="Eraser" icon={<Eraser />} active={selectedTool === "eraser"} onClick={() => setSelectedTool("eraser")} />
        <div className="w-[1px] h-4 bg-stone-200 mx-1.5" />
        <ToolButton label="Undo" icon={<Undo2 />} onClick={onUndo} disabled={!canUndo} />
        <ToolButton label="Redo" icon={<Redo2 />} onClick={onRedo} disabled={!canRedo} />
        <ToolButton 
          label="Clear" 
          icon={<Trash2 className="hover:text-rose-500 transition-colors" />} 
          onClick={onClear} 
        />
        <div className="w-[1px] h-4 bg-stone-200 mx-1.5" />
        <ToolButton label="Export PNG" icon={<Download />} onClick={onDownload} />
      </div>
    </div>
  );
};