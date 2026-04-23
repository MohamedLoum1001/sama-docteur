// src/services/dispoService.js
import { db } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export const DispoService = {
    // Récupérer les dispos d'un docteur spécifique
    getDoctorDispo: async (doctorId) => {
        const docRef = doc(db, "disponibilites", doctorId);
        const snap = await getDoc(docRef);
        return snap.exists() ? snap.data().horaires : [];
    },

    // Ajouter un seul créneau (plus performant que de renvoyer tout le tableau)
    addSlot: async (doctorId, slotData) => {
        const docRef = doc(db, "disponibilites", doctorId);
        await updateDoc(docRef, {
            horaires: arrayUnion(slotData),
            updatedAt: new Date()
        });
    },

    // Retirer un seul créneau
    removeSlot: async (doctorId, slotData) => {
        const docRef = doc(db, "disponibilites", doctorId);
        await updateDoc(docRef, {
            horaires: arrayRemove(slotData)
        });
    }
};