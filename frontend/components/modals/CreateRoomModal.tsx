"use client";

import { useState } from "react";
import { ArrowUpRight, AlertCircle, Sparkles } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { BACKEND_URL } from "@/app/config";
import { useRouter } from "next/navigation";

const SUGGESTED_ROOM_NAMES = [
  "sprint-planning",
  "design-sync",
  "brainstorm-session",
  "architecture",
];

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError("");
    const name = roomName.trim();

    if (!name) {
      setError("Please enter a room name.");
      return;
    }
    if (name.length < 3) {
      setError("Room name must be at least 3 characters long.");
      return;
    }
    if (name.length > 20) {
      setError("Room name cannot exceed 20 characters.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to create a room.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms`, {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slug: name }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        onClose();
        setRoomName("");
        router.push(`/canvas/${data.id}`);
      } else {
        setError(data.message || "Failed to create room. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please make sure backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setRoomName("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create a room"
      subtitle="Give your room a unique name to start collaborating."
      badgeDotColor="#2563eb"
      badgeText="New Room"
    >
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <Input
          placeholder="e.g. sprint-planning"
          leftIcon={<Sparkles size={16} className="text-[#2563eb]" />}
          value={roomName}
          onChange={(e) => {
            setRoomName(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />

        <div className="flex flex-wrap gap-1.5 items-center pt-1">
          <span className="text-[11px] font-semibold text-stone-400 mr-1">
            Suggestions:
          </span>
          {SUGGESTED_ROOM_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setRoomName(name);
                if (error) setError("");
              }}
              className="text-[11px] font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1 rounded-full transition cursor-pointer"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="secondary"
        size="md"
        isLoading={loading}
        onClick={handleCreate}
        rightIcon={<ArrowUpRight size={16} />}
        className="w-full mt-2 shadow-[0_8px_30px_rgba(28,25,23,0.15)]"
      >
        Create Room
      </Button>
    </Modal>
  );
}
