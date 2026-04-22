import leadSocket from "./lead.socket.js";

const registerSocketEvents = (socket, io) => {
  leadSocket(socket, io);
};

export default registerSocketEvents;
