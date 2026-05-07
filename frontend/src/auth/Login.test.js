import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login'; // Ajuste le chemin selon ta structure

describe('Tests Unitaires - Page Login', () => {
    test('Affiche une erreur si les champs sont vides au clic', async () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const submitButton = screen.getByRole('button', { name: /se connecter/i });
        fireEvent.click(submitButton);

        // Vérifie si un message d'erreur apparaît (selon ta logique de validation)
        await waitFor(() => {
            expect(screen.queryByText(/veuillez remplir tous les champs/i) ||
                screen.queryByText(/erreur/i)).toBeTruthy();
        });
    });

    test('Met à jour les champs de saisie', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const emailInput = screen.getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'test@sama.com' } });
        expect(emailInput.value).toBe('test@sama.com');
    });
});