// singleton socket connection
import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
      withCredentials: true,
    });
  }
  return socket;
};
