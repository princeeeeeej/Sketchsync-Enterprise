"use client";

import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "dark" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold tracking-tight rounded-full transition duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 select-none";

    const variantStyles = {
      primary:
        "bg-[#e85d4c] hover:bg-[#d44d3c] text-white shadow-[0_8px_30px_rgba(232,93,76,0.3)]",
      secondary:
        "bg-stone-900 hover:bg-stone-800 text-white shadow-[0_8px_30px_rgba(28,25,23,0.18)]",
      outline:
        "border border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-white bg-white/90 shadow-sm",
      dark:
        "bg-stone-800/60 text-stone-300 border border-stone-600 hover:border-stone-500 hover:text-white",
      ghost:
        "text-stone-600 hover:text-stone-900 hover:bg-stone-100",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-sm",
    };

    const sizeStyles = {
      sm: "px-4 py-2 text-xs gap-1.5",
      md: "px-6 py-3 text-sm gap-2",
      lg: "px-8 py-3.5 text-sm gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {leftIcon}
            <span>{children}</span>
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
