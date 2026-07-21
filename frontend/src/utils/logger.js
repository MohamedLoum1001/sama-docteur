// src/frontend/utils/logger.js - Service centralisé de traçabilité des accès applicatifs

/**
 * Consigne un événement d'audit sécurisé pour les données de santé
 * @param {string} action - Type d'action (ex: READ_DOSSIER, CREATE_ORDONNANCE, LOGIN)
 * @param {string} userId - UID de l'utilisateur ayant déclenché l'action
 * @param {string} targetResource - Collection ou document ciblé (ex: "users/qOuBpTpATrei...")
 * @param {string} status - Statut de l'opération ("SUCCESS", "DENIED", "FAILED")
 * @param {Object} req - Objet de requête Express pour capturer le contexte réseau
 */
const logAuditEvent = (action, userId, targetResource, status, req = {}) => {
    const auditLog = {
        timestamp: new Date().toISOString(),
        action,
        operatorId: userId || "ANONYMOUS",
        targetResource,
        status,
        ipAddress: req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || "127.0.0.1",
        userAgent: req.headers?.['user-agent'] || "UNKNOWN_CLIENT"
    };

    // Consignation structurée dans le flux standard (capturé par l'infrastructure d'exploitation)
    console.log(`[AUDIT_LOG_HEALTH] ${JSON.stringify(auditLog)}`);
};

module.exports = { logAuditEvent };