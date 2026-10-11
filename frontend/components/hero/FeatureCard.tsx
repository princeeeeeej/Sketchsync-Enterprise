"use client";

import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

export function FeatureCard({
  icon,
  iconBg,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="feature-card group p-7 rounded-2xl bg-white border border-stone-200 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-stone-300/80 transition duration-300 pointer-events-auto">
      <div
        className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}
      >
        {icon}
      </div>
      <h3 className="text-[15px] font-bold text-stone-900 mb-2">{title}</h3>
      <p className="text-sm text-stone-500 leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}
