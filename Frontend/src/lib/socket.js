import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    let backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    if (backendUrl.endsWith("/api")) {
      backendUrl = backendUrl.replace(/\/api$/, "");
    } else if (backendUrl.endsWith("/api/")) {
      backendUrl = backendUrl.replace(/\/api\/$/, "");
    }

    socket = io(backendUrl, {
      autoConnect: true,
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }
  return socket;
};
