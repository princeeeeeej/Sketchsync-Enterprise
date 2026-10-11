"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CreateRoomModal } from "./modals/CreateRoomModal";
import { JoinRoomModal } from "./modals/JoinRoomModal";
import { Button } from "./ui/Button";

export default function Navbar() {
  const router = useRouter();
  const [openCreateRoom, setOpenCreateRoom] = useState(false);
  const [openJoinRoom, setOpenJoinRoom] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsAuth(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleOpenCreate = () => {
      setOpenCreateRoom(true);
    };

    window.addEventListener("open-create-room", handleOpenCreate);

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("createRoom") === "true") {
        setOpenCreateRoom(true);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }

    return () => {
      window.removeEventListener("open-create-room", handleOpenCreate);
    };
  }, []);

  useGSAP(() => {
    if (!isScrolled) {
      gsap.fromTo(
        ".navbar-container",
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out" }
      );
    }

    gsap.fromTo(
      ".navbar-item",
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power3.out", delay: 0.15 }
    );
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (isScrolled) {
        gsap.set(".navbar-container", {
          width: "92%",
          maxWidth: "1120px",
          borderRadius: "9999px",
          backgroundColor: "rgba(255, 255, 255, 0.88)",
          borderColor: "rgba(231, 229, 228, 0.9)",
          boxShadow: "0 16px 40px -12px rgba(0, 0, 0, 0.08)",
          paddingLeft: "28px",
          paddingRight: "28px",
          paddingTop: "12px",
          paddingBottom: "12px",
          y: 16,
          opacity: 1,
        });
      }
      return;
    }

    if (isScrolled) {
      gsap.to(".navbar-container", {
        width: "92%",
        maxWidth: "1120px",
        borderRadius: "9999px",
        backgroundColor: "rgba(255, 255, 255, 0.88)",
        borderColor: "rgba(231, 229, 228, 0.9)",
        boxShadow: "0 16px 40px -12px rgba(0, 0, 0, 0.08)",
        paddingLeft: "28px",
        paddingRight: "28px",
        paddingTop: "12px",
        paddingBottom: "12px",
        y: 16,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(".navbar-container", {
        width: "100%",
        maxWidth: "100%",
        borderRadius: "0px",
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        borderColor: "rgba(231, 229, 228, 0.4)",
        boxShadow: "0 0px 0px rgba(0, 0, 0, 0)",
        paddingLeft: "48px",
        paddingRight: "48px",
        paddingTop: "20px",
        paddingBottom: "20px",
        y: 0,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [isScrolled]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuth(false);
    router.push("/");
  };

  return (
    <>
      <CreateRoomModal
        isOpen={openCreateRoom}
        onClose={() => setOpenCreateRoom(false)}
      />

      <JoinRoomModal
        isOpen={openJoinRoom}
        onClose={() => setOpenJoinRoom(false)}
      />

      <div className="fixed top-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <nav className="navbar-container opacity-0 flex justify-between items-center pointer-events-auto border border-stone-200/40 backdrop-blur-md w-full max-w-full rounded-none px-12 py-5 bg-white/50">
          <Link href="/" className="navbar-item flex gap-2.5 items-center group">
            <img
              src="/logo.png"
              alt="logo"
              className="w-6 h-6 opacity-90 group-hover:scale-105 transition-transform"
            />
            <span className="font-serif text-2xl tracking-tight text-stone-900 font-medium">
              SketchSync
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {!isAuth ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push("/signin")}
                className="navbar-item shadow-md"
              >
                Sign In
              </Button>
            ) : (
              <>
                <button
                  onClick={() => setOpenCreateRoom(true)}
                  className="navbar-item px-4.5 py-1.5 border border-stone-200/90 text-stone-700 rounded-full text-sm font-medium hover:bg-white hover:text-stone-900 transition active:scale-95 cursor-pointer bg-white/70 shadow-sm"
                >
                  Create Room
                </button>
                <button
                  onClick={() => setOpenJoinRoom(true)}
                  className="navbar-item px-4.5 py-1.5 border border-stone-200/90 text-stone-700 rounded-full text-sm font-medium hover:bg-white hover:text-stone-900 transition active:scale-95 cursor-pointer bg-white/70 shadow-sm"
                >
                  Join Room
                </button>
                <button
                  onClick={handleLogout}
                  className="navbar-item px-4 py-1.5 bg-stone-100 border border-stone-200 text-stone-700 rounded-full text-sm font-medium hover:bg-stone-200 hover:text-stone-900 transition active:scale-95 cursor-pointer"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}