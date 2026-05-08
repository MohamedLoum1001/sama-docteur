import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// ✅ Mock Firebase complet
jest.mock('./firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn((cb) => {
      // On simule une réponse immédiate d'utilisateur connecté
      cb({ uid: '123', email: 'test@sama.com' });
      return jest.fn(); // Mock de la fonction de désinscription
    }),
    currentUser: { uid: '123' }
  },
  db: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ role: 'patient' })
    })
  }
}));

test("Intégration : L'application affiche la navigation au démarrage", async () => {
  render(
    <MemoryRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </MemoryRouter>
  );

  // ✅ On attend jusqu'à 5 secondes que "SAMA" apparaisse
  // Cela laisse le temps aux mocks Firebase et Agora de se stabiliser
  const brandElement = await screen.findByText(/SAMA/i, {}, { timeout: 5000 });
  expect(brandElement).toBeInTheDocument();
});