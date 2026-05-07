import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('Intégration : L\'application affiche la navigation au démarrage', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  // Vérifie si un élément de la Sidebar ou Navbar est présent
  const brandElement = screen.getByText(/SAMA/i);
  expect(brandElement).toBeInTheDocument();
});