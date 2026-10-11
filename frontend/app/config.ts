export const BACKEND_URL = ""
export const WS_URL = "ws://localhost:8082/ws"

export const JWT_SECRET = process.env.JWT_SECRET || "65432"

export const isSignedIn = typeof window !== "undefined" && !!localStorage.getItem("token")
