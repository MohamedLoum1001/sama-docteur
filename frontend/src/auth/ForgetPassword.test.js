import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import ForgetPassword from "./forgetPassword/ForgetPassword";

// Mock complet du module Firebase Auth
jest.mock("firebase/auth", () => ({
    sendPasswordResetEmail: jest.fn(),
}));

// CORRECTIF : Depuis src/auth/, on remonte d'un seul niveau (../) pour atteindre src/configuration/
jest.mock("../configuration/firebase", () => ({
    auth: { config: "mocked-auth" },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

describe("Tests Unitaires Exhaustifs - ForgetPassword", () => {
    let consoleErrorSpy;

    beforeAll(() => {
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <ForgetPassword />
            </BrowserRouter>
        );
    };

    test("1. Rendu initial et mise à jour du champ email", () => {
        renderComponent();

        expect(screen.getByText("Récupération")).toBeInTheDocument();

        const emailInput = screen.getByPlaceholderText("exemple@email.com");
        expect(emailInput.value).toBe("");

        fireEvent.change(emailInput, { target: { value: "test@samadocteur.com" } });
        expect(emailInput.value).toBe("test@samadocteur.com");
    });

    test("2. Scénario Nominal : Succès de l'envoi du lien de réinitialisation", async () => {
        sendPasswordResetEmail.mockResolvedValueOnce();

        renderComponent();

        const emailInput = screen.getByPlaceholderText("exemple@email.com");
        fireEvent.change(emailInput, { target: { value: "succes@sama.com" } });

        const submitButton = screen.getByRole("button", { name: /envoyer le lien/i });
        fireEvent.click(submitButton);

        expect(screen.getByText(/envoi.../i)).toBeInTheDocument();
        expect(submitButton).toBeDisabled();

        const alertSuccess = await screen.findByText(/Un lien de réinitialisation a été envoyé/i);
        expect(alertSuccess).toBeInTheDocument();
        expect(alertSuccess).toHaveClass("alert-success");
        expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    });

    test("3. Scénario d'Erreur : Compte utilisateur introuvable (auth/user-not-found)", async () => {
        const firebaseError = { code: "auth/user-not-found" };
        sendPasswordResetEmail.mockRejectedValueOnce(firebaseError);

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("exemple@email.com"), { target: { value: "inconnu@sama.com" } });
        fireEvent.click(screen.getByRole("button", { name: /envoyer le lien/i }));

        const alertError = await screen.findByText("Aucun compte n'est associé à cet email.");
        expect(alertError).toBeInTheDocument();
        expect(alertError).toHaveClass("alert-danger");
    });

    test("4. Scénario d'Erreur : Identifiants invalides (auth/invalid-credential)", async () => {
        const firebaseError = { code: "auth/invalid-credential" };
        sendPasswordResetEmail.mockRejectedValueOnce(firebaseError);

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("exemple@email.com"), { target: { value: "invalid@sama.com" } });
        fireEvent.click(screen.getByRole("button", { name: /envoyer le lien/i }));

        const alertError = await screen.findByText("Aucun compte n'est associé à cet email.");
        expect(alertError).toBeInTheDocument();
    });

    test("5. Scénario d'Erreur : Syntaxe d'email invalide (auth/invalid-email)", async () => {
        const firebaseError = { code: "auth/invalid-email" };
        sendPasswordResetEmail.mockRejectedValueOnce(firebaseError);

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("exemple@email.com"), { target: { value: "bad-email" } });
        fireEvent.click(screen.getByRole("button", { name: /envoyer le lien/i }));

        const alertError = await screen.findByText("L'adresse email n'est pas valide.");
        expect(alertError).toBeInTheDocument();
    });

    test("6. Scénario d'Erreur : Tentatives abusives (auth/too-many-requests)", async () => {
        const firebaseError = { code: "auth/too-many-requests" };
        sendPasswordResetEmail.mockRejectedValueOnce(firebaseError);

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("exemple@email.com"), { target: { value: "spam@sama.com" } });
        fireEvent.click(screen.getByRole("button", { name: /envoyer le lien/i }));

        const alertError = await screen.findByText("Trop de tentative. Veuillez réessayer plus tard.");
        expect(alertError).toBeInTheDocument();
    });

    test("7. Scénario d'Erreur : Erreur Firebase générique / inconnue", async () => {
        const firebaseError = { code: "auth/unknown-error" };
        sendPasswordResetEmail.mockRejectedValueOnce(firebaseError);

        renderComponent();

        fireEvent.change(screen.getByPlaceholderText("exemple@email.com"), { target: { value: "error@sama.com" } });
        fireEvent.click(screen.getByRole("button", { name: /envoyer le lien/i }));

        const alertError = await screen.findByText("Une erreur est survenue.");
        expect(alertError).toBeInTheDocument();
    });

    test("8. Interaction : Clic sur le bouton de retour à la connexion", () => {
        renderComponent();

        const backButton = screen.getByRole("button", { name: /retour à la connexion/i });
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
});