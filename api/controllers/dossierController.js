// api/controllers/dossierController.js
const { db } = require("../config/firebase");
const { logAuditEvent } = require("../utils/logger");

/**
 * Récupère le dossier médical d'un patient et enregistre la trace d'audit
 */
exports.getPatientFolder = async (req, res) => {
    const { patientId } = req.params;
    // Injecté par authMiddleware
    const doctorUid = req.user.uid;

    try {
        const dossierDoc = await db.collection("dossiersMedicaux").doc(patientId).get();

        if (!dossierDoc.exists) {
            logAuditEvent("READ_DOSSIER_PATIENT", doctorUid, `dossiersMedicaux/${patientId}`, "FAILED", req);
            return res.status(404).json({ error: "Dossier médical introuvable." });
        }

        // Trace d'audit sur accès réussi
        logAuditEvent("READ_DOSSIER_PATIENT", doctorUid, `dossiersMedicaux/${patientId}`, "SUCCESS", req);

        return res.status(200).json(dossierDoc.data());
    } catch (error) {
        logAuditEvent("READ_DOSSIER_PATIENT", doctorUid, `dossiersMedicaux/${patientId}`, "DENIED", req);
        return res.status(500).json({ error: "Erreur lors de la récupération du dossier." });
    }
};