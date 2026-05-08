// tests/authController.test.js
const { validateEmail } = require('../utils/validator');

describe('Validation d\'Email', () => {

    test('devrait accepter un email valide', () => {
        expect(validateEmail('contact@samadocteur.com')).toBe(true);
        expect(validateEmail('user.name+tag@gmail.com')).toBe(true);
    });

    test('devrait rejeter un email sans @', () => {
        expect(validateEmail('testsamadocteur.com')).toBe(false);
    });

    test('devrait rejeter un email sans extension (ex: .com)', () => {
        expect(validateEmail('test@samadocteur')).toBe(false);
    });

    test('devrait rejeter un email avec des caractères invalides', () => {
        expect(validateEmail('test@sama docteur.com')).toBe(false); // Espace
        expect(validateEmail('test@samadocteur..com')).toBe(false); // Double point
    });

    test('devrait rejeter une chaîne vide', () => {
        expect(validateEmail('')).toBe(false);
    });

});