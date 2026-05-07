import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
// ✅ On remonte vers src puis on descend dans pages/admin/dashboard
// ✅ Note la faute de frappe "Dasboard" pour correspondre à ton fichier
import Dashboard from '../../src/pages/admin/dashboard/Dasboard';

describe('Composant Dashboard', () => {
    test('devrait afficher le titre du tableau de bord', () => {
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );
        // On utilise "findByText" car le dashboard peut mettre un peu de temps à charger
        expect(screen.getByText(/Tableau de bord Admin/i)).toBeInTheDocument();
    });
});