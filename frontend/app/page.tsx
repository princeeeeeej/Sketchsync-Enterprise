"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import HeroPage from "@/components/HeroPage";
import FrameAnimation from "@/components/FrameAnimation";
import FinalCTA from "@/components/FinalCTA";
import { useAuth } from "@/hooks/useAuth";

import type { RoomMode } from "@/components/RoomModal";

export type { RoomMode };
export type RoomModalMode = RoomMode;

export default function Home() {
  const router = useRouter();
  const { user, isCheckingAuth, checkSession } = useAuth();
  const [roomModalMode, setRoomModalMode] =
    useState<RoomMode | null>(null);

  const openRoomModal = async (mode: RoomMode) => {
    // If user is already authenticated
    if (user) {
      setRoomModalMode(mode);
      return;
    }

    // If still verifying on initial page load, check directly
    if (isCheckingAuth) {
      const activeUser = await checkSession();
      if (activeUser) {
        setRoomModalMode(mode);
        return;
      }
    }

    // Not authenticated -> redirect to sign in page
    router.push("/signin");
  };

  const closeRoomModal = () => {
    setRoomModalMode(null);
  };

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#f5f4f0] text-stone-900">
      <Navbar
        roomModalMode={roomModalMode}
        onOpenRoomModal={openRoomModal}
        onCloseRoomModal={closeRoomModal}
      />

      <HeroPage onOpenRoomModal={openRoomModal} />

      <div className="relative z-20 -mt-30">
        <FrameAnimation onOpenRoomModal={openRoomModal} />
      </div>

      <FinalCTA onOpenRoomModal={openRoomModal} />
    </main>
  );
}