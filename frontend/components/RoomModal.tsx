"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  X,
  Plus,
  Users,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import { BACKEND_URL } from "@/app/config";

export type RoomMode = "create" | "join";
export type RoomModalMode = RoomMode;
type Mode = RoomMode;

export interface RoomModalProps {
  open: boolean;
  initialMode: RoomMode;
  onClose: () => void;
}

interface RoomResponse {
  id: number;
  slug: string;
  adminId: string;
  createdAt: string;
}

interface ApiError {
  message?: string;
  detail?: string;
  error?: string;
  title?: string;
}

export default function RoomModal({
  open,
  initialMode,
  onClose,
}: RoomModalProps) {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    setMode(initialMode);
    setSlug("");
    setError("");

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, initialMode, onClose, loading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const roomSlug = slug.trim().toLowerCase();

    if (!roomSlug) {
      setError("Please enter a room name.");
      return;
    }

    // Keep room names URL-friendly.
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(roomSlug)) {
      setError(
        "Use lowercase letters, numbers, and hyphens. Do not include spaces."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "create" ? "/api/rooms" : "/api/rooms/join";

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ slug: roomSlug }),
      });

      const data: Partial<RoomResponse> & ApiError =
        await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            data.message ||
            data.detail ||
            (response.status === 401
              ? "Please sign in to continue."
              : "You are not authorized to perform this action.")
          );
        }

        throw new Error(
          data.message ||
          data.detail ||
          data.error ||
          (response.status === 404
            ? "Room not found. Check the room name."
            : mode === "create"
              ? "Could not create the room. It may already exist."
              : "Could not join the room. Please check the room name.")
        );
      }

      // The backend returns RoomResponse: id, slug, adminId, createdAt.
      if (
        typeof data.id !== "number" ||
        !Number.isFinite(data.id)
      ) {
        throw new Error(
          "The server response did not contain a valid room ID."
        );
      }

      const roomId = data.id;

      onClose();
      router.push(`/canvas/${encodeURIComponent(String(roomId))}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/35 p-4 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-modal-title"
        className="relative my-auto w-full max-w-lg rounded-[28px] border border-white/70 bg-[#FAFAF8]/95 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl sm:p-9"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close room dialog"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <div className="mb-7 pr-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1747FF] text-white shadow-lg shadow-[#1747FF]/20">
            {mode === "create" ? (
              <Plus size={23} />
            ) : (
              <Users size={22} />
            )}
          </div>

          <h2
            id="room-modal-title"
            className="text-3xl font-semibold tracking-[-0.05em] text-[#111318]"
          >
            {mode === "create"
              ? "Create a room."
              : "Join a room."}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {mode === "create"
              ? "Start with a blank canvas and bring your team together."
              : "Enter the room name shared by your teammate to join their canvas."}
          </p>
        </div>

        {/* Switch between create and join */}
        <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("create");
              setError("");
            }}
            disabled={loading}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${mode === "create"
                ? "bg-white text-[#1747FF] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Create room
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("join");
              setError("");
            }}
            disabled={loading}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${mode === "join"
                ? "bg-white text-[#1747FF] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <span className="inline-flex items-center gap-2">
              <Users size={16} />
              Join room
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="room-slug"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Room name
          </label>

          <div className="flex items-center rounded-2xl border border-slate-200 bg-white transition-all focus-within:border-[#1747FF] focus-within:ring-4 focus-within:ring-[#1747FF]/10">
            <span className="select-none pl-4 text-sm text-slate-400">
              sketch/
            </span>

            <input
              id="room-slug"
              name="slug"
              type="text"
              autoComplete="off"
              autoFocus
              required
              maxLength={255}
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                if (error) setError("");
              }}
              placeholder={
                mode === "create"
                  ? "my-awesome-project"
                  : "team-project"
              }
              disabled={loading}
              className="w-full min-w-0 bg-transparent py-4 pl-1 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="mt-3 flex items-start gap-2 text-sm text-red-600"
            >
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1747FF] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-[#1747FF]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1039D9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
                {mode === "create"
                  ? "Creating..."
                  : "Joining..."}
              </>
            ) : (
              <>
                {mode === "create"
                  ? "Create room"
                  : "Join room"}
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          One canvas. Many minds. Endless possibilities.
        </p>
      </section>
    </div>,
    document.body
  );
}