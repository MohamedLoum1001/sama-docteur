import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "./Dasboard";
import { getDocs } from "firebase/firestore";

// CORRECTIF CRITIQUE : Ajouter getFirestore dans le mock global pour éviter le crash d'initialisation
jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => ({})), // Empêche l'erreur d'appel de fonction
    collection: jest.fn(),
    getDocs: jest.fn()
}));

// Mock du layout local DashboardLayout
jest.mock("./DashboardLayout", () => {
    return {
        __esModule: true,
        default: ({ children }) => <div data-testid="mock-dashboard-layout">{children}</div>
    };
});

// Mock de lucide-react pour neutraliser les rendus SVG complexes
jest.mock("lucide-react", () => ({
    Users: () => <span data-testid="icon-users" />,
    Activity: () => <span data-testid="icon-activity" />,
    Stethoscope: () => <span data-testid="icon-stethoscope" />,
    Heart: () => <span data-testid="icon-heart" />,
    Scissors: () => <span data-testid="icon-scissors" />,
    ArrowUpRight: () => <span data-testid="icon-arrow" />,
    BarChart3: () => <span data-testid="icon-barchart" />,
    Pill: () => <span data-testid="icon-pill" />
}));

describe("Tests Unitaires Exhaustifs - Dashboard Admin Firestore", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Dashboard />
            </BrowserRouter>
        );
    };

    test("1. Rendu de l'état initial de chargement (Loading)", async () => {
        getDocs.mockReturnValue(new Promise(() => { }));

        renderComponent();

        expect(screen.getByText("Analyse des spécialités...")).toBeInTheDocument();

        const suspenses = screen.getAllByText("...");
        expect(suspenses).toHaveLength(3);
    });

    test("2. Rendu des statistiques et ventilation des spécialités après récupération Firebase", async () => {
        const mockDocs = {
            docs: [
                { data: () => ({ role: "medecin", specialite: "Dentiste" }) },
                { data: () => ({ role: "medecin", specialite: "Cardiologue" }) },
                { data: () => ({ role: "medecin", specialite: "Dermatologue" }) },
                { data: () => ({ role: "medecin", specialite: "Pharmacie" }) },
                { data: () => ({ role: "medecin", specialite: "Pédiatre" }) },
                { data: () => ({ role: "medecin" }) },
                { data: () => ({ role: "patient" }) },
                { data: () => ({ role: "patient" }) }
            ]
        };

        getDocs.mockResolvedValueOnce(mockDocs);

        renderComponent();

        await waitFor(() => {
            expect(screen.queryByText("Analyse des spécialités...")).not.toBeInTheDocument();
        });

        expect(screen.getByText("8")).toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();

        expect(screen.getByTestId("icon-scissors")).toBeInTheDocument();
        expect(screen.getByTestId("icon-heart")).toBeInTheDocument();
        expect(screen.getByTestId("icon-pill")).toBeInTheDocument();

        expect(screen.getByText("Gestion des comptes")).toBeInTheDocument();
        expect(screen.getByText("Rapports & Analytics")).toBeInTheDocument();
    });

    test("3. Gestion de l'affichage en cas d'absence totale de spécialités", async () => {
        const mockDocsEmptyMedecins = {
            docs: [
                { data: () => ({ role: "patient" }) }
            ]
        };

        getDocs.mockResolvedValueOnce(mockDocsEmptyMedecins);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText("Aucune spécialité détectée.")).toBeInTheDocument();
        });
    });

    test("4. Captation et isolation des erreurs lors de l'échec de getDocs", async () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        getDocs.mockRejectedValueOnce(new Error("Firebase Crash"));

        renderComponent();

        await waitFor(() => {
            expect(screen.queryByText("Analyse des spécialités...")).not.toBeInTheDocument();
        });

        expect(consoleSpy).toHaveBeenCalledWith("Erreur stats:", expect.any(Error));
        consoleSpy.mockRestore();
    });
});