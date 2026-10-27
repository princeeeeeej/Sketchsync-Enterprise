"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CanvasManager } from "../canvas/CanvasManager";
import { ResizeHandle, ShapeStyles, Tool } from "../canvas/types";

import { BACKEND_URL } from "@/app/config";
import { useRouter } from "next/navigation";
import PropertiesPanel from "./PropertiesPanel";
import { ToolBar } from "./ToolBaar";
import { AvatarStack } from "./AvatarStack";

let lastCursorSend = 0;
let lastPreviewSend = 0;

export default function Canvas({
  roomId,
  socket,
  userId,
  name,
}: {
  roomId: string;
  socket: WebSocket;
  userId: string;
  name: string;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<CanvasManager | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Tool>("pointer");
  const [textInput, setTextInput] = useState<{
    canvasX: number;
    canvasY: number;
    screenX: number;
    screenY: number;
    value: string;
  } | null>(null);
  const [selectedShapeStyles, setSelectedShapeStyles] =
    useState<ShapeStyles | null>(null);
  const [selectedShapeType, setSelectedShapeType] = useState<string | null>(
    null,
  );
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [collaborators, setCollaborators] = useState<
    Record<string, { id: string; name: string }>
  >({});
  const [roomSlug, setRoomSlug] = useState<string>("");
  const [canvasCursor, setCanvasCursor] = useState<string>("default");

  const syncHistoryState = useCallback(() => {
    setCanUndo(managerRef.current?.canUndo() ?? false);
    setCanRedo(managerRef.current?.canRedo() ?? false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const manager = new CanvasManager(
      canvas,
      (shape) => {
        if (socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({ type: "draw", elements: shape, roomId: Number(roomId) }));
        socket.send(JSON.stringify({ type: "save", data: shape, roomId: Number(roomId) }));
      },
      (ids) => {
        if (socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({ type: "erase", ids, roomId: Number(roomId) }));
        setTimeout(() => {
          const shapes = managerRef.current?.getAllShapes() ?? [];
          socket.send(
            JSON.stringify({ type: "save", data: shapes, roomId: Number(roomId) }),
          );
        }, 100);
      },
      (x, y) => {
        socket.send(
          JSON.stringify({ type: "cursor", x, y, roomId: Number(roomId), userId, name }),
        );
      },
      (canvasX, canvasY, screenX, screenY) => {
        setTextInput({ canvasX, canvasY, screenX, screenY, value: "" });
      },
      (styles, shapeType) => {
        setSelectedShapeStyles(styles);
        setSelectedShapeType(shapeType);
      },
      () => {
        syncHistoryState();
      },
    );

    managerRef.current = manager;
    syncHistoryState();

    const token = localStorage.getItem("token");
    fetch(`${BACKEND_URL}/api/canvas/${roomId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load canvas: ${response.status}`
          );
        }

        return response.json();
      })
      .then((data) => {
        const rawShapes =
          data?.data?.elements ??
          data?.data ??
          data?.elements ??
          [];

        manager.loadShapes(
          Array.isArray(rawShapes) ? rawShapes : []
        );
      })
      .catch((error) => {
        console.error("Canvas load error:", error);
        setError("Failed to load the canvas. Please retry.");
      });

    // Fetch room details to get slug
    fetch(`${BACKEND_URL}/api/rooms/${roomId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.slug) setRoomSlug(data.slug);
        }
      })
      .catch(() => { });

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (!managerRef.current) return;

      if (message.type === "error") {
        console.error("WebSocket Error from server:", message.message);
      }
      if (message.type === "room_joined") {
        const users = message.users || [];
        setCollaborators((prev) => {
          const next = { ...prev };
          users.forEach((id: string) => {
            if (id !== userId && !next[id]) {
              next[id] = { id, name: "Collaborator" };
            }
          });
          return next;
        });
      }
      if (message.type === "user_joined") {
        if (message.userId !== userId) {
          setCollaborators((prev) => ({
            ...prev,
            [message.userId]: { id: message.userId, name: "Collaborator" }
          }));
        }
      }
      if (message.type === "draw")
        managerRef.current.onRemoteDraw(message.elements);
      if (message.type === "erase")
        managerRef.current.onRemoteErase(message.ids);
      if (message.type === "canvas_state" || message.type === "snapshot") {
        const rawShapes =
          message.data?.data?.elements ??
          message.data?.data ??
          message.data?.elements ??
          (Array.isArray(message.data) ? message.data : []);
        const shapes = Array.isArray(rawShapes) ? rawShapes : [];
        if (shapes.length > 0) {
          managerRef.current.loadShapes(shapes);
        }
      }
      if (message.type === "cursor") {
        managerRef.current.updateCursor(
          message.userId,
          message.x,
          message.y,
          message.name,
        );
        setCollaborators((prev) => {
          if (!prev[message.userId]) {
            return {
              ...prev,
              [message.userId]: { id: message.userId, name: message.name },
            };
          }
          return prev;
        });
      }
      if (message.type === "preview") {
        if (message.element) {
          managerRef.current?.updatePreview(message.userId, message.element);
        }
      }
      if (message.type === "user_left") {
        managerRef.current.removeCursor(message.userId);
        setCollaborators((prev) => {
          const next = { ...prev };
          delete next[message.userId];
          return next;
        });
      }
      if (message.type === "request_snapshot") {
        const shapes = managerRef.current.getAllShapes();
        socket.send(
          JSON.stringify({
            type: "save",
            data: shapes,
            roomId: message.roomId,
          }),
        );
      }
      if (message.type === "clear_preview") {
        managerRef.current.clearPreview(message.userId);
      }
    };

    const joinRoom = () => {
      if (socket.readyState !== WebSocket.OPEN) {
        return;
      }

      socket.send(
        JSON.stringify({
          type: "join_room",
          roomId: Number(roomId),
        })
      );
    };

    if (socket.readyState === WebSocket.OPEN) {
      joinRoom();
    } else {
      socket.addEventListener("open", joinRoom, { once: true });
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = 1 - e.deltaY * 0.005;
      managerRef.current?.zoomAt(e.offsetX, e.offsetY, factor);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac =
        typeof navigator !== "undefined" &&
        navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) {
          managerRef.current?.redo();
        } else {
          managerRef.current?.undo();
        }
      } else if (modifier && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        managerRef.current?.redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      socket.removeEventListener("open", joinRoom);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleToolChange = (tool: Tool) => {
    setActive(tool);
    managerRef.current?.setTool(tool);
  };

  const handleStyleChange = (partialStyle: Partial<ShapeStyles>) => {
    managerRef.current?.updateSelectedStyle(partialStyle);
    const fresh = managerRef.current?.getSelectedShapeStyles();
    setSelectedShapeStyles(fresh ? { ...fresh } : null);
  };

  const commitText = () => {
    if (!textInput || !textInput.value.trim()) {
      setTextInput(null);
      return;
    }
    managerRef.current?.commitText(
      textInput.canvasX,
      textInput.canvasY,
      textInput.value,
    );
    setTextInput(null);
  };

  if (error) {
    return (
      <div className="w-screen h-screen bg-[#fcfcfb] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-stone-200/90 rounded-3xl p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl">
            !
          </div>
          <h2 className="font-serif text-2xl text-stone-900 font-medium">Room Unavailable</h2>
          <p className="text-sm text-stone-500">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-2 w-full py-3 rounded-full bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition active:scale-95 cursor-pointer shadow-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getCanvasCursor = (): string => {
    if (active === "eraser") return "url('/eraser.svg') 5 5, auto";
    if (active === "text") return "text";
    if (active === "pointer" && canvasCursor !== "default") return canvasCursor;
    return "default";
  };

  const getResizeCursor = (handle: ResizeHandle): string => {
    switch (handle) {
      case "nw":
      case "se":
        return "nwse-resize";
      case "ne":
      case "sw":
        return "nesw-resize";
      case "n":
      case "s":
        return "ns-resize";
      case "e":
      case "w":
        return "ew-resize";
      default:
        return "default";
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#fcfcfb]">
      <div
        className="
            absolute left-6 top-3 z-50
            rounded-[9px]
            border border-[#1747FF]
            bg-[#1747FF]
            px-4 py-2.5
            text-sm font-medium
            tracking-[-0.045em]
            text-white
            shadow-[0_4px_14px_rgba(23,71,255,0.18)]
            transition-all duration-200
            hover:bg-[#1238D5]
            "
      >
        {roomSlug ? (
          <span>{roomSlug}</span>
        ) : (
          <>
            <span className="text-white/75">Room</span>{" "}
            <span className="font-semibold">#{roomId}</span>
          </>
        )}
      </div>
      <AvatarStack
        users={[
          { id: userId, name: name },
          ...Object.values(collaborators)
        ]}
        currentUserId={userId}
      />
      <canvas
        ref={canvasRef}
        style={{ cursor: getCanvasCursor() }}
        onPointerDown={(e) =>
          managerRef.current?.onPointerDown(
            e.nativeEvent.offsetX,
            e.nativeEvent.offsetY,
          )
        }
        onPointerMove={(e) => {
          managerRef.current?.onPointerMove(
            e.nativeEvent.offsetX,
            e.nativeEvent.offsetY,
          );

          // Update cursor for resize handles when in pointer mode
          if (active === "pointer" && managerRef.current) {
            const { x, y } = managerRef.current.toCanvasCoords(
              e.nativeEvent.offsetX,
              e.nativeEvent.offsetY,
            );
            const handle = managerRef.current.getActiveHandle(x, y);
            if (handle) {
              setCanvasCursor(getResizeCursor(handle));
            } else {
              const shape = managerRef.current.getShape(x, y);
              setCanvasCursor(shape ? "move" : "default");
            }
          }

          const now = Date.now();
          if (now - lastCursorSend < 33) return;
          lastCursorSend = now;

          if (!managerRef.current) return;
          if (socket.readyState !== WebSocket.OPEN) return;

          const { x, y } = managerRef.current.toCanvasCoords(
            e.nativeEvent.offsetX,
            e.nativeEvent.offsetY,
          );
          socket.send(
            JSON.stringify({ type: "cursor", x, y, roomId: Number(roomId), userId, name }),
          );

          if (now - lastPreviewSend >= 16) {
            if (managerRef.current.isCurrentlyDrawing()) {
              const preview = managerRef.current.getCurrentShapeData();
              if (preview) {
                socket.send(
                  JSON.stringify({
                    type: "preview",
                    userId,
                    element: preview,
                    roomId: Number(roomId),
                  }),
                );
              }
            }

            if (managerRef.current.isCurrentlyTransforming()) {
              const preview = managerRef.current.getTransformPreview();
              if (preview) {
                socket.send(
                  JSON.stringify({
                    type: "preview",
                    userId,
                    element: preview,
                    roomId: Number(roomId),
                  }),
                );
              }
            }

            lastPreviewSend = now;
          }
        }}
        onPointerUp={(e) => {
          managerRef.current?.onPointerUp(
            e.nativeEvent.offsetX,
            e.nativeEvent.offsetY,
          );
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "clear_preview",
                userId,
                roomId: Number(roomId),
              }),
            );
          }
        }}
      />
      {textInput && (
        <textarea
          autoFocus
          className="absolute outline-none resize-none overflow-hidden"
          style={{
            left: textInput.screenX,
            top: textInput.screenY,
            fontSize: "16px",
            fontFamily: "sans-serif",
            minWidth: "120px",
            minHeight: "32px",
            lineHeight: "1.4",
            color: "#1c1917",
            caretColor: "#1c1917",
            background: "rgba(255, 255, 255, 0.95)",
            border: "2px solid #3b82f6",
            borderRadius: "6px",
            padding: "6px 8px",
            boxShadow: "0 4px 16px rgba(59, 130, 246, 0.15), 0 0 0 3px rgba(59, 130, 246, 0.08)",
            zIndex: 1000,
          }}
          value={textInput.value}
          onChange={(e) =>
            setTextInput((prev) =>
              prev ? { ...prev, value: e.target.value } : null,
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Escape") setTextInput(null);
            if (e.key === "Enter" && !e.shiftKey) commitText();
          }}
          onBlur={() => commitText()}
        />
      )}
      <ToolBar
        selectedTool={active}
        setSelectedTool={handleToolChange}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => {
          managerRef.current?.undo();
          syncHistoryState();
        }}
        onRedo={() => {
          managerRef.current?.redo();
          syncHistoryState();
        }}
        onClear={() => {
          managerRef.current?.clearCanvas();
          console.log("Clear canvas clicked");
        }}
        onDownload={() => {
          managerRef.current?.exportPNG();
        }}
      />
      {selectedShapeStyles && (
        <PropertiesPanel
          style={selectedShapeStyles}
          onChange={handleStyleChange}
          shapeType={selectedShapeType}
        />
      )}
    </div>
  );
}
