import { useEffect } from "react";

import { connectSocket, disconnectSocket } from "@/app/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
export const useSocket = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!currentUser?.id) {
      console.log("❌ User not loaded yet");
      return;
    }
    console.log("✅ Connecting socket");
    connectSocket(currentUser);

    return () => {
      disconnectSocket();
    };
  }, [currentUser]);
};
