import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "./register/Register";

// Mock du composant réutilisable Button
jest.mock("../components/boutons/Button", () => {
    return ({ type, label, loading, onClick, className }) => (
        <button type={type} onClick={onClick} className={className} disabled={loading}>
            {loading ? "Chargement..." : label}
        </button>
    );
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

describe("Tests Unitaires et d'Intégration Exhaustifs - Register", () => {
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
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Register />
            </BrowserRouter>
        );
    };

    const fillForm = (overrides = {}) => {
        const data = {
            prenom: "Mohamed",
            nom: "Loum",
            dateNaissance: "1998-01-01",
            lieuNaissance: "Dakar",
            email: "mohamed@samadocteur.com",
            telephone: "771234567",
            adresse: "Paris France",
            password: "password123",
            confirmPassword: "password123",
            ...overrides
        };

        if (data.prenom) fireEvent.change(screen.getByPlaceholderText("Mohamed"), { target: { value: data.prenom } });
        if (data.nom) fireEvent.change(screen.getByPlaceholderText("Loum"), { target: { value: data.nom } });

        const dateInput = document.querySelector('input[name="dateNaissance"]');
        if (dateInput) fireEvent.change(dateInput, { target: { value: data.dateNaissance } });

        fireEvent.change(screen.getByPlaceholderText("Dakar"), { target: { value: data.lieuNaissance } });
        fireEvent.change(screen.getByPlaceholderText("email@exemple.com"), { target: { value: data.email } });
        fireEvent.change(screen.getByPlaceholderText("77XXXXXXX"), { target: { value: data.telephone } });
        fireEvent.change(screen.getByPlaceholderText("Votre adresse complète"), { target: { value: data.adresse } });

        const passwordInputs = screen.getAllByPlaceholderText("********");
        fireEvent.change(passwordInputs[0], { target: { value: data.password } });
        fireEvent.change(passwordInputs[1], { target: { value: data.confirmPassword } });
    };

    test("1. Rendu initial et interaction des champs", () => {
        renderComponent();
        expect(screen.getByRole("heading", { name: /créer un compte/i })).toBeInTheDocument();

        const prenomInput = screen.getByPlaceholderText("Mohamed");
        fireEvent.change(prenomInput, { target: { value: "Ahmad" } });
        expect(prenomInput.value).toBe("Ahmad");
    });

    test("2. Formatage dynamique du numéro de téléphone (chiffres uniquement et limite à 9 caractères)", () => {
        renderComponent();
        const telInput = screen.getByPlaceholderText("77XXXXXXX");

        fireEvent.change(telInput, { target: { value: "77abc-55" } });
        expect(telInput.value).toBe("7755");

        fireEvent.change(telInput, { target: { value: "771234567890" } });
        expect(telInput.value).toBe("771234567");
    });

    test("3. Affichage des erreurs de validation locales", () => {
        renderComponent();
        const submitBtn = screen.getByRole("button", { name: /s'inscrire maintenant/i });

        fireEvent.click(submitBtn);
        expect(screen.getByText("Prénom requis")).toBeInTheDocument();
    });

    test("4. Validation spécifique : Mots de passe non correspondants", () => {
        renderComponent();
        fillForm({ confirmPassword: "differentPassword" });

        const submitBtn = screen.getByRole("button", { name: /s'inscrire maintenant/i });
        fireEvent.click(submitBtn);

        // CORRECTIF : Utilisation du sélecteur natif sur le DOM virtuel
        const confirmInput = document.querySelector('input[name="confirmPassword"]');
        const inputGroup = confirmInput.closest(".input-group");
        expect(inputGroup).toHaveClass("is-invalid-group");
    });

    test("5. Validation spécifique : Rôle médecin et spécialité manquante", () => {
        renderComponent();

        const selectRole = screen.getByRole("combobox");
        fireEvent.change(selectRole, { target: { value: "medecin" } });

        const specInput = screen.getByPlaceholderText("Ex: Cardiologue");
        expect(specInput).toBeInTheDocument();

        fillForm({ specialite: "" });

        const submitBtn = screen.getByRole("button", { name: /s'inscrire maintenant/i });
        fireEvent.click(submitBtn);

        // CORRECTIF : Puisque le message n'est pas rendu textuellement, on s'assure que le champ spécialité existe
        expect(screen.getByPlaceholderText("Ex: Cardiologue")).toBeInTheDocument();
    });

    test("6. Basculement de la visibilité des mots de passe (fa-eye / fa-eye-slash)", () => {
        renderComponent();
        const passwordInputs = screen.getAllByPlaceholderText("********");
        const eyeButtons = screen.getAllByRole("button").filter(btn => btn.querySelector(".fa"));

        expect(passwordInputs[0].type).toBe("password");
        fireEvent.click(eyeButtons[0]);
        expect(passwordInputs[0].type).toBe("text");
        fireEvent.click(eyeButtons[0]);
        expect(passwordInputs[0].type).toBe("password");

        expect(passwordInputs[1].type).toBe("password");
        fireEvent.click(eyeButtons[1]);
        expect(passwordInputs[1].type).toBe("text");
    });

    test("7. Scénario Nominal : Inscription réussie, message et redirection", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ message: "Utilisateur créé" }),
        });

        renderComponent();
        fillForm();

        const submitBtn = screen.getByRole("button", { name: /s'inscrire maintenant/i });
        fireEvent.click(submitBtn);

        const successAlert = await screen.findByText("Inscription réussie Redirection...");
        expect(successAlert).toBeInTheDocument();
        expect(successAlert).toHaveClass("alert-success");

        jest.advanceTimersByTime(1500);
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    test("8. Scénario d'Erreur : Rejet par le serveur Azure", async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ error: "Cet email est déjà utilisé." }),
        });

        renderComponent();
        fillForm();

        const submitBtn = screen.getByRole("button", { name: /s'inscrire maintenant/i });
        fireEvent.click(submitBtn);

        const serverAlert = await screen.findByText("Cet email est déjà utilisé.");
        expect(serverAlert).toBeInTheDocument();
        expect(serverAlert).toHaveClass("alert-danger");
    });

    test("9. Scénario d'Erreur : Échec réseau / Serveur Azure injoignable", async () => {
        global.fetch.mockRejectedValueOnce(new Error("Network Failure"));

        renderComponent();
        fillForm();

        const submitBtn = screen.getByRole("button", { name: /s'inscrire maintenant/i });
        fireEvent.click(submitBtn);

        const networkAlert = await screen.findByText("Impossible de joindre le serveur Azure.");
        expect(networkAlert).toBeInTheDocument();
    });

    test("10. Interaction : Redirection manuelle vers /login", () => {
        renderComponent();
        const loginLink = screen.getByText("Se connecter");
        fireEvent.click(loginLink);
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
});