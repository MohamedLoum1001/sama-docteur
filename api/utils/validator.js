/**
 * Valide si une chaîne est un email conforme aux standards
 * @param {string} email 
 * @returns {boolean}
 */
const validateEmail = (email) => {
    // Regex stricte : 
    // 1. Autorise lettres, chiffres et certains caractères spéciaux avant le @
    // 2. Vérifie la présence d'un domaine et d'une extension de 2 lettres minimum
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Sécurité supplémentaire :
    // Les emails ne peuvent pas contenir deux points consécutifs (..)
    if (email.includes('..')) return false;

    return re.test(email);
};

module.exports = { validateEmail };