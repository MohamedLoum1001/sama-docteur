import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../configuration/firebase";

const createNotification = async (userId, message) => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      message,
      isRead: false,
      createdAt: serverTimestamp(),
      type: "rendezvous",
    });
  } catch (error) {
    console.error("Erreur création notification :", error);
  }
};
