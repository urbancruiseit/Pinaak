const leadSocket = (socket, io) => {
  socket.on("lead:create", (data) => {
    console.log("Lead Created", data);

    io.emit("leadCreated", data);
  });
};

export default leadSocket;
