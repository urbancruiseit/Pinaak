import { getSocket, connectSocket, disconnectSocket } from "./index";

export const listenToLeadUpdates = (callback: (data: any) => void) => {
  const socket = getSocket();

  socket.on("leadCreated", (data) => {
    console.log("Lead created via socket:", data);
    callback(data);
  });

  socket.on("leadUpdated", (data) => {
    console.log("Lead updated via socket:", data);
    callback(data);
  });

  socket.on("leadDeleted", (data) => {
    console.log("Lead deleted via socket:", data);
    callback(data);
  });
};

export const removeLeadListeners = () => {
  const socket = getSocket();
  socket.off("leadCreated");
  socket.off("leadUpdated");
  socket.off("leadDeleted");
};

export { connectSocket, disconnectSocket, getSocket };
