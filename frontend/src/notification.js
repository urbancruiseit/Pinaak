// import { messaging } from "./firebase";
// import { getToken, onMessage } from "firebase/messaging";

// export const generateToken = async () => {
//   try {
//     // Request permission first
//     const permission = await Notification.requestPermission();

//     if (permission === "granted") {
//       console.log("Notification permission granted");

//       const token = await getToken(messaging, {
//         vapidKey:
//           "BL4NmRFPp_-hMrtGaCdGaP4xLXOYTEzvPcKltzW4gCBCjZwslRAUFM-trWCBK_RH1OTGw40ABFNGvIlWkyzUduI",
//       });

//       console.log("FCM Token:", token);

//       if (token) {
//         // Send token to backend
//         const response = await fetch(
//           "http://localhost:5000/api/v1/token/save-token",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ token }),
//           },
//         );

//         if (!response.ok) {
//           throw new Error("Failed to save token");
//         }

//         console.log("Token saved successfully");

//         // Return token for any additional use
//         return token;
//       }
//     } else {
//       console.log("Notification permission denied");
//     }
//   } catch (error) {
//     console.log("Token error:", error);
//   }
// };

// // Handle foreground messages
// export const onMessageListener = () => {
//   return new Promise((resolve) => {
//     onMessage(messaging, (payload) => {
//       console.log("Foreground message received:", payload);

//       // Show browser notification for foreground messages
//       if (Notification.permission === "granted") {
//         new Notification(payload.notification.title, {
//           body: payload.notification.body,
//           icon: "/icon.png",
//           vibrate: [200, 100, 200],
//         });
//       }

//       resolve(payload);
//     });
//   });
// };
