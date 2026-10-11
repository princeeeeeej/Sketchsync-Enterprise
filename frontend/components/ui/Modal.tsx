"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badgeDotColor?: string;
  badgeText?: string;
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  badgeDotColor = "#2563eb",
  badgeText = "Room",
  children,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-stone-950/40 backdrop-blur-md transition-all duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="pointer-events-auto w-full max-w-md bg-gradient-to-b from-white via-white to-[#faf9f6] border border-stone-200/90 rounded-[32px] shadow-[0_32px_100px_rgba(15,23,42,0.18)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-7 py-4 border-b border-stone-100/80 bg-stone-50/50">
            <div className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm animate-pulse"
                style={{
                  backgroundColor: badgeDotColor,
                  boxShadow: `0 0 10px ${badgeDotColor}80`,
                }}
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                {badgeText}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-7 flex flex-col gap-5">
            <div>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-stone-900 leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-stone-500 mt-1.5 leading-relaxed font-medium">
                  {subtitle}
                </p>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
