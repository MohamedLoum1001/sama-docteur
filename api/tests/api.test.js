const request = require('supertest');
const app = require('../index');

describe('Tests des routes API Sama Docteur', () => {

    // 1. Test de santé (Health Check)
    test('GET /api/health devrait retourner un status 200', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });

    // 2. Test de sécurité (Authentification)
    test('GET /api/auth/users devrait retourner 401 si non authentifié', async () => {
        const res = await request(app).get('/api/auth/users');

        // On s'attend à 401 (Unauthorized) car aucun token n'est envoyé
        expect(res.statusCode).toEqual(401);
    });
});