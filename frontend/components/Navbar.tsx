"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Layers3,
  BookOpen,
  LogIn,
  Pencil,
  Plus,
  DoorOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import gsap from "gsap";

import { BACKEND_URL } from "@/app/config";
import RoomModal, { type RoomMode } from "@/components/RoomModal";
import { NavProfileDropdown } from "./NavProfileDropdown";

interface NavbarProps {
  roomModalMode?: RoomMode | null;
  onOpenRoomModal: (mode: RoomMode) => void;
  onCloseRoomModal?: () => void;
}

interface AuthUser {
  id?: string;
  userId?: string;
  name?: string;
  email?: string;
  photo?: string | null;
}

const publicLinks = [
  { label: "Features", href: "/#features", Icon: Layers3 },
  { label: "Docs", href: "/docs", Icon: BookOpen },
  { label: "Sign in", href: "/signin", Icon: LogIn },
  { label: "Get started", href: "/signup", Icon: Pencil },
];

const authenticatedLinks = [
  { label: "Features", href: "/#features", Icon: Layers3 },
  { label: "Docs", href: "/docs", Icon: BookOpen },
  { label: "Create room", href: "/api/rooms", Icon: Plus },
  { label: "Join room", href: "/api/rooms/join", Icon: DoorOpen },
];

export default function Navbar({
  roomModalMode,
  onOpenRoomModal,
  onCloseRoomModal,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const iconsRef = useRef<(SVGSVGElement | null)[]>([]);

  const [hovered, setHovered] = useState<number | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAuthenticated = user !== null;
  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  const active = links.findIndex(
    (link) =>
      !link.href.includes("#") &&
      (pathname === link.href ||
        pathname.startsWith(`${link.href}/`))
  );

  // Check the user's session.
  const checkSession = useCallback(async () => {
    setIsCheckingAuth(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data: AuthUser = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Unable to check authentication:", error);
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    void checkSession();
  }, [checkSession, pathname]);

  // Close the mobile menu after navigation.
  useEffect(() => {
    setMobileMenuOpen(false);
    setHovered(null);
  }, [pathname]);

  // Shrink the navbar after scrolling past 40px.
  useEffect(() => {
    let previousState = window.scrollY > 40;

    setIsScrolled(previousState);

    const handleScroll = () => {
      const nextState = window.scrollY > 40;

      if (nextState !== previousState) {
        previousState = nextState;
        setIsScrolled(nextState);
      }
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Animate desktop links and icons on hover/focus.
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    itemsRef.current.forEach((item, index) => {
      if (!item) return;

      const isPrimary = index === links.length - 1;
      const isHovered = hovered === index;
      const isActive = active === index;

      gsap.to(item, {
        flexGrow: isHovered ? 1.25 : 1,

        backgroundColor: isPrimary
          ? isHovered
            ? "#1039D9"
            : "#1747FF"
          : isHovered
            ? "#EEF3FF"
            : isActive
              ? "#F5F7FF"
              : "transparent",

        color: isPrimary
          ? "#FFFFFF"
          : isHovered || isActive
            ? "#1747FF"
            : "#475569",

        duration: reducedMotion ? 0.01 : 0.35,
        ease: "power3.inOut",
        overwrite: "auto",
      });

      const icon = iconsRef.current[index];

      if (icon) {
        gsap.to(icon, {
          scale: isHovered ? 1.12 : 1,
          duration: reducedMotion ? 0.01 : 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    });
  }, [hovered, active, links.length, isAuthenticated]);

  // Open the shared room modal.
  const openRoomModal = (mode: RoomMode) => {
    if (!isAuthenticated) {
      setMobileMenuOpen(false);
      router.push("/signin");
      return;
    }

    onOpenRoomModal(mode);
    setMobileMenuOpen(false);
  };

  // Log out the current user.
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed. Please try again.");
      }

      setUser(null);
      setMobileMenuOpen(false);
      onCloseRoomModal?.();

      router.push("/signin");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);

      setLogoutError(
        error instanceof Error
          ? error.message
          : "Unable to log out. Please try again."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 px-3 transition-[padding] duration-300 ease-in-out sm:px-4 ${
        isScrolled ? "pt-2" : "pt-3"
      }`}
    >
      {/* Main floating navbar */}
      <nav
        className={`mx-auto flex items-center justify-between gap-3 border border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-xl transition-[width,max-width,padding,border-radius] duration-300 ease-in-out ${
          isScrolled
            ? "w-[calc(100%-1rem)] max-w-5xl rounded-2xl px-2.5 py-1.5 sm:w-[calc(100%-2rem)] sm:px-4"
            : "w-full max-w-7xl rounded-xl px-3 py-2.5 sm:px-5"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="SketchSync home"
          className="flex min-w-0 shrink-0 items-center gap-2"
        >
          <img
            src="/logo.png"
            alt=""
            className={`shrink-0 object-contain transition-all duration-300 ${
              isScrolled ? "h-7 w-7" : "h-8 w-8"
            }`}
          />

          <span
            className={`whitespace-nowrap font-bold tracking-tight text-slate-950 transition-all duration-300 ${
              isScrolled
                ? "text-base sm:text-lg"
                : "text-lg sm:text-xl"
            }`}
          >
            Sketch<span className="text-[#1747FF]">Sync</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="ml-auto hidden min-w-0 flex-1 items-center justify-end gap-3 md:flex">
          <div
            className="flex min-w-0 flex-1 items-center justify-end gap-1"
            onMouseLeave={() => setHovered(null)}
          >
            {links.map(({ label, href, Icon }, index) => (
              <Link
                key={label}
                href={href}
                onClick={(event) => {
                  if (
                    label === "Create room" ||
                    label === "Join room"
                  ) {
                    event.preventDefault();

                    openRoomModal(
                      label === "Create room" ? "create" : "join"
                    );
                  }
                }}
                ref={(element) => {
                  itemsRef.current[index] = element;
                }}
                onMouseEnter={() => setHovered(index)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                aria-current={
                  active === index ? "page" : undefined
                }
                className={`flex min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg px-2 text-sm font-medium transition-[padding] duration-300 lg:px-3 ${
                  isScrolled ? "py-1.5" : "py-2"
                } ${
                  index === links.length - 1
                    ? "bg-[#1747FF] text-white"
                    : "text-slate-600"
                }`}
                style={{ flexBasis: 0 }}
              >
                <Icon
                  ref={(element) => {
                    iconsRef.current[index] = element;
                  }}
                  size={isScrolled ? 15 : 17}
                  strokeWidth={1.8}
                  className="shrink-0"
                />

                <span className="hidden xl:inline">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          {/* Desktop profile */}
          <div
            className={`flex shrink-0 items-center justify-center transition-[width] duration-300 ${
              isCheckingAuth || isAuthenticated ? "w-10" : "w-0"
            }`}
          >
            {isCheckingAuth ? (
              <div
                className={`animate-pulse rounded-2xl bg-[#EEF3FF] transition-all duration-300 ${
                  isScrolled ? "h-8 w-8" : "h-10 w-10"
                }`}
              />
            ) : isAuthenticated ? (
              <NavProfileDropdown
                user={user}
                initials={initials}
                isScrolled={isScrolled}
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
              />
            ) : null}
          </div>
        </div>

        {/* Mobile actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2 md:hidden">
          {isCheckingAuth ? (
            <div
              className={`animate-pulse rounded-xl bg-[#EEF3FF] transition-all duration-300 ${
                isScrolled ? "h-8 w-8" : "h-9 w-9"
              }`}
            />
          ) : isAuthenticated ? (
            <NavProfileDropdown
              user={user}
              initials={initials}
              isScrolled={isScrolled}
              onLogout={handleLogout}
              isLoggingOut={isLoggingOut}
              isMobile
            />
          ) : null}

          <button
            type="button"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            onClick={() =>
              setMobileMenuOpen((open) => !open)
            }
            className={`flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-all duration-300 hover:bg-[#EEF3FF] hover:text-[#1747FF] ${
              isScrolled ? "h-8 w-8" : "h-9 w-9"
            }`}
          >
            {mobileMenuOpen ? (
              <X size={isScrolled ? 17 : 19} />
            ) : (
              <Menu size={isScrolled ? 17 : 19} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        className={`mx-auto mt-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition-all duration-200 md:hidden ${
          isScrolled
            ? "w-[calc(100%-1rem)] max-w-5xl sm:w-[calc(100%-2rem)]"
            : "w-full max-w-7xl"
        } ${
          mobileMenuOpen
            ? "visible max-h-[28rem] translate-y-0 p-3 opacity-100"
            : "invisible max-h-0 -translate-y-2 border-transparent p-0 opacity-0"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex flex-col gap-1">
          {links.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={href}
              tabIndex={mobileMenuOpen ? 0 : -1}
              onClick={(event) => {
                setMobileMenuOpen(false);

                if (
                  label === "Create room" ||
                  label === "Join room"
                ) {
                  event.preventDefault();

                  openRoomModal(
                    label === "Create room" ? "create" : "join"
                  );
                }
              }}
              aria-current={
                !href.includes("#") &&
                (pathname === href ||
                  pathname.startsWith(`${href}/`))
                  ? "page"
                  : undefined
              }
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                href === links[links.length - 1].href
                  ? "bg-[#1747FF] text-white hover:bg-[#1039D9]"
                  : "text-slate-600 hover:bg-[#EEF3FF] hover:text-[#1747FF]"
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Logout error */}
      {logoutError && (
        <p
          role="alert"
          className="mx-auto mt-2 max-w-7xl rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 shadow-sm"
        >
          {logoutError}
        </p>
      )}

      {/* Shared Create / Join room modal (if mode is passed) */}
      {roomModalMode !== undefined && onCloseRoomModal && (
        <RoomModal
          open={roomModalMode !== null}
          initialMode={roomModalMode ?? "create"}
          onClose={onCloseRoomModal}
        />
      )}
    </header>
  );
}