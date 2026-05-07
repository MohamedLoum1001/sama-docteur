import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
// ✅ Nouveau chemin vers le dossier pages/admin
import Sidebar from './pages/admin/sidebar/Sidebar';

test('Vérifie que le lien Dashboard est présent dans le Sidebar', () => {
    render(
        <BrowserRouter>
            <Sidebar />
        </BrowserRouter>
    );
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
});