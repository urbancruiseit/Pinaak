import { createTripBookingModel, getAllTripBookings } from "./website.model.js";

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
