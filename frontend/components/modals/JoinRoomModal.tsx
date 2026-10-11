"use client";

import { useState } from "react";
import { ArrowUpRight, AlertCircle, Hash } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { BACKEND_URL } from "@/app/config";
import { useRouter } from "next/navigation";

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setError("");
    const rawId = roomId.trim();

    if (!rawId) {
      setError("Please enter a Room ID.");
      return;
    }

    if (rawId.length < 3) {
      setError("Room name must be at least 3 characters.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to join a room.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/join`, {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slug: rawId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to join room.");
        return;
      }
      onClose();
      setRoomId("");
      router.push(`/canvas/${data.id}`);
    } catch (err) {
      console.error(err);
      setError("Network error. Please make sure backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setRoomId("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Join a room"
      subtitle="Enter the unique room name shared by your teammate."
      badgeDotColor="#e85d4c"
      badgeText="Join Room"
    >
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <Input
        placeholder="e.g. sprint-planning"
        leftIcon={<Hash size={16} className="text-[#e85d4c]" />}
        value={roomId}
        onChange={(e) => {
          setRoomId(e.target.value);
          if (error) setError("");
        }}
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
      />

      <Button
        variant="secondary"
        size="md"
        isLoading={loading}
        onClick={handleJoin}
        rightIcon={<ArrowUpRight size={16} />}
        className="w-full mt-2 shadow-[0_8px_30px_rgba(28,25,23,0.15)]"
      >
        Join Room
      </Button>
    </Modal>
  );
}
