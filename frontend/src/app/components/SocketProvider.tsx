"use client";
import { useSocket } from "./hook/useSocket";

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  console.log("🟡 SocketProvider mounted");
  useSocket();
  return <>{children}</>;
};
