import presalesSocket from "./presales.socket.js";

import socketRooms from "./socketRooms.js";

const registerSocketEvents = (socket, io) => {
  socketRooms(socket);

  presalesSocket(socket, io);
};

export default registerSocketEvents;
