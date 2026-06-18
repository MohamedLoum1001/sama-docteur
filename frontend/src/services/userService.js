import { auth, db } from "../configuration/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

/**
 * Service pour l'inscription d'un utilisateur
 * @param {Object} data - Les données du formulaire
 */
export const registerUser = async (data) => {
    try {
        // 1. Création du compte dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );
        const user = userCredential.user;

        // 2. Préparation des données pour Firestore
        const userDoc = {
            id: user.uid,
            prenom: data.prenom,
            nom: data.nom,
            email: data.email,
            adresse: data.adresse,
            telephone: data.telephone,
            dateNaissance: data.dateNaissance,
            lieuNaissance: data.lieuNaissance,
            role: data.role,
            specialite: data.role === "medecin" ? data.specialite : "",
            createdAt: new Date().toISOString(),
        };

        // 3. Enregistrement dans la collection "users"
        await setDoc(doc(db, "users", user.uid), userDoc);

        return { success: true, user: userDoc };
    } catch (error) {
        throw error;
    }
};