import { createTripBookingModel, getAllTripBookings, markWebsiteGacAsRead } from "./website.model.js";

export const createTripBooking = async (data) => {
  const id = await createTripBookingModel(data);

  return {
    id,
    ...data,
  };
};
// ================= GET ALL TRIP BOOKINGS =================

export const getTripBookings = async () => {
  return await getAllTripBookings();
};
export const markWebsiteGacRead = async (id) => {
  return await markWebsiteGacAsRead(id);
};
