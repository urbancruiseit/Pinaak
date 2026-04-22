const leadSocket = (socket, io) => {
  socket.on("lead:create", (data) => {
    // console.log("Lead Created", data);
    io.emit("leadCreated", data);
  });

  socket.on("lead:update", (data) => {
    // console.log("Lead Updated", data);
    io.emit("leadUpdated", data);
  });

  socket.on("lead:delete", (data) => {
    // console.log("Lead Deleted", data);
    io.emit("leadDeleted", data);
  });
};

export default leadSocket;
