import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// 1. Mock de react-router-dom pour espionner la redirection <Navigate />
jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        Navigate: jest.fn(({ to, replace }) => (
            <div data-testid="mock-navigate" data-to={to} data-replace={replace ? "true" : "false"}>
                Redirected to {to}
            </div>
        )),
    };
});

// Import de la version mockée pour les assertions
import { Navigate } from "react-router-dom";

describe("Tests Unitaires - ProtectedRoute", () => {
    let consoleSpy;

    beforeEach(() => {
        // Nettoyage du localStorage avant chaque test
        localStorage.clear();
        jest.clearAllMocks();

        // Espion sur console.log pour éviter de polluer la console du terminal
        consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    test("1. Redirige vers /login si aucun utilisateur n'est présent dans le localStorage", () => {
        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ProtectedRoute>
                    <div data-testid="protected-content">Contenu Privé</div>
                </ProtectedRoute>
            </BrowserRouter>
        );

        // Vérifie que le contenu protégé n'est PAS affiché
        expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();

        // Vérifie que l'alerte console a bien été émise
        expect(consoleSpy).toHaveBeenCalledWith("Accès refusé : Aucun utilisateur en session.");

        // Vérifie que le composant <Navigate /> a été appelé avec les bons paramètres
        expect(Navigate).toHaveBeenCalledWith(
            expect.objectContaining({ to: "/login", replace: true }),
            expect.any(Object)
        );

        // Vérification visuelle via le mock rendu dans le DOM
        const navigateEl = screen.getByTestId("mock-navigate");
        expect(navigateEl).toBeInTheDocument();
        expect(navigateEl).toHaveAttribute("data-to", "/login");
        expect(navigateEl).toHaveAttribute("data-replace", "true");
    });

    test("2. Affiche et autorise l'accès aux enfants si l'utilisateur est présent en session", () => {
        // Simulation d'un utilisateur connecté stocké dans le localStorage
        const mockUser = { uid: "12345", email: "mohamed.loum@example.com", role: "admin" };
        localStorage.setItem("user", JSON.stringify(mockUser));

        render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ProtectedRoute>
                    <div data-testid="protected-content">Contenu Privé</div>
                </ProtectedRoute>
            </BrowserRouter>
        );

        // Le contenu protégé doit être rendu à l'écran
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
        expect(screen.getByText("Contenu Privé")).toBeInTheDocument();

        // Aucune redirection ne doit s'activer
        expect(Navigate).not.toHaveBeenCalled();
        expect(screen.queryByTestId("mock-navigate")).not.toBeInTheDocument();
    });
});