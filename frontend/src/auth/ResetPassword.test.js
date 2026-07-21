import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter, useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import ResetPassword from "./resetPassword/ResetPassword";

// Mock du composant réutilisable Button
jest.mock("../components/boutons/Button", () => {
    return ({ type, label, loading, disabled, className }) => (
        <button type={type} className={className} disabled={disabled || loading}>
            {loading ? "Chargement..." : label}
        </button>
    );
});

// Mock de Firebase Auth
jest.mock("firebase/auth", () => ({
    confirmPasswordReset: jest.fn(),
}));

// Mock de la configuration Firebase locale pour éviter les erreurs d'importation relatifs
jest.mock("../configuration/firebase", () => ({
    auth: { config: "mocked-auth" },
}));

const mockNavigate = jest.fn();
let mockGetParam = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useSearchParams: () => [{ get: mockGetParam }],
}));

describe("Tests Unitaires Globaux - ResetPassword", () => {
    let consoleErrorSpy;

    beforeAll(() => {
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ResetPassword />
            </BrowserRouter>
        );
    };

    test("1. Scénario d'Erreur : Chargement sans token oobCode dans l'URL (Lien expiré/invalide)", () => {
        mockGetParam.mockReturnValueOnce(null); // Pas de code oobCode
        renderComponent();

        const alertMsg = screen.getByText(/Lien de réinitialisation invalide ou expiré/i);
        expect(alertMsg).toBeInTheDocument();
        expect(alertMsg).toHaveClass("alert-danger");

        // Les inputs doivent être désactivés
        const inputs = screen.getAllByPlaceholderText("••••••••");
        expect(inputs[0]).toBeDisabled();
        expect(inputs[1]).toBeDisabled();
    });

    test("2. Interaction : Saisie et basculement de la visibilité des champs", () => {
        mockGetParam.mockReturnValue("valid-token-code");
        renderComponent();

        const passwordInputs = screen.getAllByPlaceholderText("••••••••");

        // Test changement de valeur
        fireEvent.change(passwordInputs[0], { target: { value: "newpass123" } });
        expect(passwordInputs[0].value).toBe("newpass123");

        // Test icône œil mot de passe principal
        const eyeBtn1 = passwordInputs[0].nextElementSibling;
        expect(passwordInputs[0].type).toBe("password");
        fireEvent.click(eyeBtn1);
        expect(passwordInputs[0].type).toBe("text");

        // Test icône œil confirmation
        const eyeBtn2 = passwordInputs[1].nextElementSibling;
        expect(passwordInputs[1].type).toBe("password");
        fireEvent.click(eyeBtn2);
        expect(passwordInputs[1].type).toBe("text");
    });

    test("3. Validation locale : Rejet si le mot de passe fait moins de 6 caractères", () => {
        mockGetParam.mockReturnValue("valid-token-code");
        renderComponent();

        const passwordInputs = screen.getAllByPlaceholderText("••••••••");
        fireEvent.change(passwordInputs[0], { target: { value: "1234" } }); // < 6 caractères
        fireEvent.change(passwordInputs[1], { target: { value: "1234" } });

        fireEvent.click(screen.getByRole("button", { name: /mettre à jour/i }));

        expect(screen.getByText("Le mot de passe doit contenir au moins 6 caractères")).toBeInTheDocument();
    });

    test("4. Validation locale : Rejet si les mots de passe ne correspondent pas", () => {
        mockGetParam.mockReturnValue("valid-token-code");
        renderComponent();

        const passwordInputs = screen.getAllByPlaceholderText("••••••••");
        fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
        fireEvent.change(passwordInputs[1], { target: { value: "passwordXYZ" } }); // Différent

        fireEvent.click(screen.getByRole("button", { name: /mettre à jour/i }));

        expect(screen.getByText("Les mots de passe ne correspondent pas")).toBeInTheDocument();
    });

    test("5. Scénario Nominal : Succès, affichage du message et redirection", async () => {
        mockGetParam.mockReturnValue("valid-token-code");
        confirmPasswordReset.mockResolvedValueOnce(); // Simule le succès Firebase

        renderComponent();

        const passwordInputs = screen.getAllByPlaceholderText("••••••••");
        fireEvent.change(passwordInputs[0], { target: { value: "validpassword" } });
        fireEvent.change(passwordInputs[1], { target: { value: "validpassword" } });

        fireEvent.click(screen.getByRole("button", { name: /mettre à jour/i }));

        const successAlert = await screen.findByText(/Mot de passe réinitialisé avec succès/i);
        expect(successAlert).toBeInTheDocument();
        expect(successAlert).toHaveClass("alert-success");

        // Déclenchement du setTimeout
        jest.advanceTimersByTime(2500);
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    test("6. Scénario d'Erreur Firebase : Mot de passe trop faible (auth/weak-password)", async () => {
        mockGetParam.mockReturnValue("valid-token-code");
        confirmPasswordReset.mockRejectedValueOnce({ code: "auth/weak-password" });

        renderComponent();

        const passwordInputs = screen.getAllByPlaceholderText("••••••••");
        fireEvent.change(passwordInputs[0], { target: { value: "123456" } });
        fireEvent.change(passwordInputs[1], { target: { value: "123456" } });

        fireEvent.click(screen.getByRole("button", { name: /mettre à jour/i }));

        const errorAlert = await screen.findByText("Le mot de passe est trop faible.");
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveClass("alert-danger");
    });

    test("7. Scénario d'Erreur Firebase : Lien expiré ou générique", async () => {
        mockGetParam.mockReturnValue("valid-token-code");
        confirmPasswordReset.mockRejectedValueOnce({ code: "auth/expired-action-code" });

        renderComponent();

        const passwordInputs = screen.getAllByPlaceholderText("••••••••");
        fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
        fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

        fireEvent.click(screen.getByRole("button", { name: /mettre à jour/i }));

        const errorAlert = await screen.findByText("Le lien a expiré ou a déjà été utilisé.");
        expect(errorAlert).toBeInTheDocument();
    });
});