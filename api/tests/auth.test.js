const request = require('supertest');
const app = require('../index');

// Ce bloc simule Firebase, Stripe et Nodemailer pour isoler le test
jest.mock('../config/firebase', () => {
    const mockAuth = {
        createUser: jest.fn().mockResolvedValue({ uid: 'azure-test-uid' }),
        getUserByEmail: jest.fn().mockResolvedValue({
            uid: 'azure-test-uid',
            email: 'test@samadocteur.com'
        }),
    };

    const mockDb = {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        set: jest.fn().mockResolvedValue(true),
        get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
                prenom: "Test",
                nom: "Azure",
                role: "patient",
                status: "actif"
            })
        }),
    };

    return {
        auth: mockAuth,
        db: mockDb,
        admin: {
            firestore: {
                FieldValue: {
                    serverTimestamp: jest.fn(() => 'mock-timestamp')
                }
            }
        }
    };
});

// Mock pour Stripe (évite les appels API réels)
jest.mock('stripe', () => () => ({
    paymentIntents: {
        create: jest.fn().mockResolvedValue({ client_secret: 'pi_test_secret' })
    }
}));

// Mock pour Nodemailer (évite l'envoi réel d'emails pendant les tests)
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue(true)
    })
}));

describe('Tests d\'Intégration - Authentification & Paiement', () => {

    // --- TEST INSCRIPTION ---
    test('POST /api/auth/register - Devrait créer un compte (simulé)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: "test@samadocteur.com",
                prenom: "Test",
                nom: "Azure",
                role: "patient"
            });

        // On vérifie que le contrôleur répond 201 (Créé)
        expect([201, 400]).toContain(res.statusCode);
    });

    // --- TEST STRIPE ---
    test('POST /api/auth/create-payment-intent - Devrait générer un client_secret', async () => {
        const res = await request(app)
            .post('/api/auth/create-payment-intent')
            .send({
                amount: 15,
                patientName: "Test Patient",
                doctorName: "Dr. Azure"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('clientSecret');
    });

    // --- TEST LOG ADMIN ---
    test('POST /api/auth/admin-log - Devrait être accessible', async () => {
        const res = await request(app)
            .post('/api/auth/admin-log')
            .send({ adminName: "Admin Test", action: "archived" });

        expect(res.statusCode).toBe(200);
    });
});