import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/admin/dashboard/Dasboard';

describe('Composant Dashboard', () => {
    test('devrait afficher le titre du tableau de bord', async () => {
        render(
            <MemoryRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <Dashboard />
            </MemoryRouter>
        );

        expect(
            await screen.findByText(/Tableau de bord Admin/i)
        ).toBeInTheDocument();
    });
});