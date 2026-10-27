"use client";

import { BACKEND_URL, WS_URL } from "@/app/config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Canvas from "./Canvas";

interface AuthUser {
  id?: string | number;
  userId?: string | number;
  name?: string | null;
  email?: string;
  photo?: string | null;
}

type ConnectionState =
  | "checking-auth"
  | "connecting"
  | "connected"
  | "error";

export default function RoomCanvas({
  roomId,
}: {
  roomId: string;
}) {
  const router = useRouter();

  const [webSocket, setWebSocket] = useState<WebSocket | null>(
    null
  );
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("checking-auth");
  const [connectionError, setConnectionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let socket: WebSocket | null = null;

    setWebSocket(null);
    setUserId("");
    setUserName("");
    setConnectionError("");
    setConnectionState("checking-auth");

    async function initializeRoom() {
      try {
        // Validate the room ID before connecting.
        const numericRoomId = Number(roomId);

        if (
          !roomId ||
          !Number.isSafeInteger(numericRoomId) ||
          numericRoomId <= 0
        ) {
          throw new Error("Invalid room ID.");
        }

        // 1. Verify authentication using the HttpOnly cookie.
        const response = await fetch(
          `${BACKEND_URL.replace(/\/$/, "")}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (cancelled) return;

        if (response.status === 401 || response.status === 403) {
          router.replace("/signin");
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Unable to verify your session (${response.status}).`
          );
        }

        const payload = await response.json();

        // Support either a direct user response or a wrapped response.
        const user: AuthUser =
          payload?.user ?? payload?.data ?? payload;

        // Your backend may return userId rather than id.
        const authenticatedUserId = user?.id ?? user?.userId;

        if (authenticatedUserId == null) {
          throw new Error(
            "The authentication response did not contain a user ID."
          );
        }

        if (cancelled) return;

        setUserId(String(authenticatedUserId));
        setUserName(
          user.name?.trim() ||
            user.email?.split("@")[0] ||
            "Anonymous"
        );

        // 2. Open the collaboration WebSocket.
        setConnectionState("connecting");

        socket = new WebSocket(WS_URL);

        socket.onopen = () => {
          if (cancelled || !socket) {
            socket?.close();
            return;
          }

          console.log("WebSocket connected:", {
            roomId: numericRoomId,
            url: WS_URL,
          });

          // Save the connected socket so Canvas can render.
          setWebSocket(socket);
          setConnectionState("connected");

          // Do not send join_room here.
          // Canvas will send it after installing its message handler.
        };

        socket.onerror = () => {
          if (cancelled) return;

          console.error(
            "WebSocket connection error:",
            WS_URL
          );

          setConnectionError(
            "Could not connect to the collaboration server. Check its status and WebSocket URL."
          );
          setConnectionState("error");
          setWebSocket(null);
        };

        socket.onclose = (event) => {
          if (cancelled) return;

          console.error("WebSocket closed:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            roomId: numericRoomId,
          });

          setWebSocket(null);
          setConnectionState("error");

          setConnectionError(
            `The collaboration connection closed (code ${event.code}). ${
              event.reason ||
              "The server closed the connection."
            }`
          );
        };
      } catch (error) {
        if (cancelled) return;

        console.error("Room initialization failed:", error);

        setWebSocket(null);
        setConnectionState("error");

        setConnectionError(
          error instanceof Error
            ? error.message
            : "Unable to initialize the room."
        );
      }
    }

    void initializeRoom();

    return () => {
      cancelled = true;

      if (socket) {
        // Detach callbacks before closing during cleanup.
        socket.onopen = null;
        socket.onerror = null;
        socket.onclose = null;

        if (socket.readyState !== WebSocket.CLOSED) {
          socket.close();
        }
      }
    };
  }, [roomId, router]);

  // Show an actionable error instead of an endless loading screen.
  if (connectionState === "error") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-[#fcfcfb] px-6 text-center">
        <img
          src="/logo.png"
          alt="SketchSync"
          className="h-8 w-8 opacity-90"
        />

        <h2 className="text-lg font-semibold text-stone-900">
          Unable to connect to the room
        </h2>

        <p
          role="alert"
          className="max-w-md text-sm leading-6 text-stone-600"
        >
          {connectionError}
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-[#1747FF] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1039D9]"
          >
            Retry connection
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Go home
          </button>
        </div>
      </div>
    );
  }

  // Authentication or WebSocket connection is still in progress.
  if (
    connectionState !== "connected" ||
    !webSocket ||
    webSocket.readyState !== WebSocket.OPEN
  ) {
    const message =
      connectionState === "checking-auth"
        ? "Verifying your session..."
        : `Connecting to room ${roomId}...`;

    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-[#fcfcfb]">
        <img
          src="/logo.png"
          alt="SketchSync"
          className="h-8 w-8 animate-pulse opacity-90"
        />

        <div className="flex items-center gap-2.5 text-sm font-medium text-stone-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />

          <span>{message}</span>

          {connectionState !== "checking-auth" && (
            <span className="font-mono font-bold text-stone-900">
              {roomId}
            </span>
          )}
        </div>
      </div>
    );
  }

  // WebSocket is open. Render the collaborative canvas.
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Canvas
        roomId={roomId}
        socket={webSocket}
        userId={userId}
        name={userName}
      />
    </div>
  );
}