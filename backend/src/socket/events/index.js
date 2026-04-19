import leadSocket from "./lead.socket";


const registerSocketEvents = (socket, io) => {

    leadSocket(socket, io);
};

export default registerSocketEvents;
