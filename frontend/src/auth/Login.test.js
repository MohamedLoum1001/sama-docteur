import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { signOut } from "firebase/auth";
import Login from "./login/Login";

// Mock du composant réutilisable Button
jest.mock("../components/boutons/Button", () => {
    return ({ type, label, loading, onClick }) => (
        <button type={type} onClick={onClick} disabled={loading}>
            {loading ? "Chargement..." : label}
        </button>
    );
});

// Mock complet du module Firebase Auth et sa méthode signOut
jest.mock("firebase/auth", () => ({
    signOut: jest.fn(() => Promise.resolve()),
}));

// Mock de la configuration Firebase locale
jest.mock("../configuration/firebase", () => ({
    auth: { config: "mocked-auth" },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

describe("Tests Unitaires et d'Intégration Exhaustifs - Login", () => {
    let consoleErrorSpy;

    beforeAll(() => {
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
        localStorage.clear();
        sessionStorage.clear();
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Login />
            </BrowserRouter>
        );
    };

    const submitLoginForm = (email = "test@sama.com", password = "password123") => {
        fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: email } });
        fireEvent.change(screen.getByPlaceholderText("Mot de passe"), { target: { value: password } });
        fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));
    };

    test("1. Rendu initial et basculement de la visibilité du mot de passe", () => {
        renderComponent();

        const passwordInput = screen.getByPlaceholderText("Mot de passe");
        expect(passwordInput.type).toBe("password");

        // Clic sur l'icône de l'œil (le conteneur cliquable juste à côté)
        const toggleEye = passwordInput.nextElementSibling;
        fireEvent.click(toggleEye);
        expect(passwordInput.type).toBe("text");

        fireEvent.click(toggleEye);
        expect(passwordInput.type).toBe("password");
    });

    test("2. Scénario d'Erreur : Échec réseau / API d'authentification injoignable", async () => {
        global.fetch.mockRejectedValueOnce(new Error("API Down"));

        renderComponent();
        submitLoginForm();

        const errorMsg = await screen.findByText(/Impossible de joindre l'API d'authentification/i);
        expect(errorMsg).toBeInTheDocument();
    });

    test("3. Scénario d'Erreur : Identifiants ou rôle incorrects (401/400 du serveur)", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ error: "Mot de passe erroné." }),
        });

        renderComponent();
        submitLoginForm();

        const errorMsg = await screen.findByText("Mot de passe erroné.");
        expect(errorMsg).toBeInTheDocument();
    });

    test("4. Cas particulier Sécurité : Compte suspendu / bloqué", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ user: { status: "blocked", prenom: "Mohamed", nom: "Loum" } }),
        });

        renderComponent();
        submitLoginForm();

        const errorMsg = await screen.findByText("Votre compte a été suspendu par l'administrateur.");
        expect(errorMsg).toBeInTheDocument();
        expect(signOut).toHaveBeenCalled();
        expect(localStorage.getItem("user")).toBeNull();
    });

    test("5. Cas particulier Sécurité : Compte archivé", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ user: { status: "archived" } }),
        });

        renderComponent();
        submitLoginForm();

        const errorMsg = await screen.findByText("Ce compte est archivé. Veuillez contacter le support.");
        expect(errorMsg).toBeInTheDocument();
        expect(signOut).toHaveBeenCalled();
    });

    test("6. Succès de Connexion : Rôle Patient", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ user: { role: "patient", prenom: "Mohamed", nom: "Loum", status: "actif" } }),
        });

        renderComponent();
        submitLoginForm();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/patient");
            expect(JSON.parse(localStorage.getItem("user"))).toHaveProperty("role", "patient");
        });
    });

    test("7. Succès de Connexion : Rôle Médecin", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ user: { role: "medecin", prenom: "Dr", nom: "Sama", status: "actif" } }),
        });

        renderComponent();
        submitLoginForm();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/medecin");
        });
    });

    test("8. Succès de Connexion : Rôle Admin", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ user: { role: "admin", prenom: "Admin", nom: "Sama", status: "actif" } }),
        });

        renderComponent();
        submitLoginForm();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/admin");
        });
    });

    test("9. Succès de Connexion : Rôle inconnu ou non défini", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ user: { role: "guest", prenom: "Guest", nom: "Sama", status: "actif" } }),
        });

        renderComponent();
        submitLoginForm();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });

    test("10. Navigation : Clic sur Mot de passe oublié et Créer un compte", () => {
        renderComponent();

        fireEvent.click(screen.getByText("Mot de passe oublié ?"));
        expect(mockNavigate).toHaveBeenCalledWith("/forget-password");

        fireEvent.click(screen.getByRole("button", { name: "Créer un compte" }));
        expect(mockNavigate).toHaveBeenCalledWith("/register");
    });
});