import { io, Socket } from "socket.io-client";

const CHAT_SERVER_URL = import.meta.env.VITE_CHAT_SERVER_URL || "http://localhost:3001";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(CHAT_SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socket;
};

export const connectSocket = (token: string): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit("authenticate", { token });
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};
