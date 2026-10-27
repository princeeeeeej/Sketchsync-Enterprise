"use client";

import { LogOut } from "lucide-react";

export interface NavProfileUser {
  name?: string;
  email?: string;
}

interface NavProfileDropdownProps {
  user: NavProfileUser;
  initials: string;
  isScrolled: boolean;
  onLogout: () => void;
  isLoggingOut: boolean;
  isMobile?: boolean;
}

/**
 * Reusable user profile badge and dropdown menu for Navbar.
 * Used consistently in both desktop and mobile headers.
 */
export function NavProfileDropdown({
  user,
  initials,
  isScrolled,
  onLogout,
  isLoggingOut,
  isMobile = false,
}: NavProfileDropdownProps) {
  const buttonDimensions = isMobile
    ? isScrolled
      ? "h-8 w-8 text-[10px]"
      : "h-9 w-9 text-xs"
    : isScrolled
      ? "h-8 w-8 text-xs"
      : "h-10 w-10 text-sm";

  const buttonRounding = isMobile ? "rounded-xl" : "rounded-2xl hover:rounded-xl";

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label="Your profile"
        className={`flex items-center justify-center border border-[#DCE5FF] bg-[#EEF3FF] font-bold text-[#1747FF] transition-all duration-300 hover:bg-[#DDE7FF] ${buttonRounding} ${buttonDimensions}`}
      >
        {initials}
      </button>

      <div className="pointer-events-none invisible absolute right-0 top-full z-50 pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
        <div className="w-52 rounded-2xl border border-[#E8ECF5] bg-white p-3 shadow-lg shadow-[#1747FF]/10">
          <p className="truncate text-sm font-semibold text-[#17213A]">
            {user.name || "Your workspace"}
          </p>

          <p className="mt-0.5 truncate text-xs text-[#8792A8]">
            {user.email}
          </p>

          <div className="my-3 h-px bg-[#EEF1F7]" />

          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-[#D94C46] transition-colors hover:bg-[#FFF0EF] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              <LogOut size={15} />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NavProfileDropdown;
