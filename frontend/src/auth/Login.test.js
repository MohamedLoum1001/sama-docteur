import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './login/Login';

describe('Tests Unitaires - Page Login', () => {
    let consoleSpy;

    // ✅ On stocke le spy dans une variable pour pouvoir le restaurer proprement
    beforeAll(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    // ✅ On utilise la variable stockée pour restaurer la console
    afterAll(() => {
        if (consoleSpy) consoleSpy.mockRestore();
    });

    // ✅ Mock global de fetch avant chaque test
    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ user: { role: 'admin' } }),
            })
        );
    });

    // ✅ Nettoyage des mocks après chaque test pour éviter les fuites de mémoire
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Affiche une erreur si les champs sont vides au clic', async () => {
        // Force une erreur immédiate pour déclencher le catch dans Login.jsx
        global.fetch.mockImplementationOnce(() => Promise.reject('Erreur'));

        render(
            <BrowserRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <Login />
            </BrowserRouter>
        );

        const submitButton = screen.getByRole('button', { name: /se connecter/i });
        fireEvent.click(submitButton);

        // ✅ findByText est idéal ici car il attend l'apparition asynchrone du message
        const errorMsg = await screen.findByText(
            /Impossible de contacter le serveur/i,
            {},
            { timeout: 3000 }
        );

        expect(errorMsg).toBeInTheDocument();
    });

    test('Met à jour les champs de saisie', () => {
        render(
            <BrowserRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <Login />
            </BrowserRouter>
        );

        const emailInput = screen.getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'test@sama.com' } });

        expect(emailInput.value).toBe('test@sama.com');
    });
});