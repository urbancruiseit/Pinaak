const socketRooms = (socket) => {
  socket.on("joinRooms", (user) => {
    // User Room
    socket.join(`user_${user.id}`);

    // Role Room
    if (user.role_id) {
      socket.join(`role_${user.role_id}`);
    }

    // Region Rooms
    if (user.region_ids?.length) {
      user.region_ids.forEach((regionId) => {
        socket.join(`region_${regionId}`);
      });
    }

    // Zone Rooms
    if (user.zone_ids?.length) {
      user.zone_ids.forEach((zoneId) => {
        socket.join(`zone_${zoneId}`);
      });
    }

    // City Rooms
    if (user.city_ids?.length) {
      user.city_ids.forEach((cityId) => {
        socket.join(`city_${cityId}`);
      });
    }

    // CEO / Global
    socket.join("all_leads");

    console.log(`✅ ${user.fullName} joined rooms`);
  });
};

export default socketRooms;
