import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
// On cible le fichier valide local à la page
import AdminDashboard from "./Dasboard";
import { getDocs } from "firebase/firestore";

// Mock global de Firebase Firestore
jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(() => ({})),
    collection: jest.fn(),
    getDocs: jest.fn()
}));

// Mock du layout local qui existe réellement dans ce dossier
jest.mock("./DashboardLayout", () => {
    return {
        __esModule: true,
        default: ({ children }) => <div data-testid="mock-dashboard-layout">{children}</div>
    };
});

// Mock complet des icônes lucide-react
jest.mock("lucide-react", () => ({
    Users: () => <span data-testid="icon-users" />,
    UserCheck: () => <span data-testid="icon-usercheck" />,
    CreditCard: () => <span data-testid="icon-creditcard" />,
    Calendar: () => <span data-testid="icon-calendar" />,
    Activity: () => <span data-testid="icon-activity" />,
    Stethoscope: () => <span data-testid="icon-stethoscope" />,
    Heart: () => <span data-testid="icon-heart" />,
    Scissors: () => <span data-testid="icon-scissors" />,
    ArrowUpRight: () => <span data-testid="icon-arrow" />,
    BarChart3: () => <span data-testid="icon-barchart" />,
    Pill: () => <span data-testid="icon-pill" />
}));

describe("Tests Unitaires - AdminDashboard (Page)", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        getDocs.mockResolvedValue({
            docs: []
        });
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AdminDashboard />
            </BrowserRouter>
        );
    };

    test("1. Rendu global dans le DashboardLayout et affichage des en-têtes textuels", async () => {
        renderComponent();

        expect(screen.getByTestId("mock-dashboard-layout")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: /Tableau de bord Admin/i })).toBeInTheDocument();
        expect(screen.getByText("Données synchronisées avec SamaDocteur")).toBeInTheDocument();

        await waitFor(() => {
            expect(getDocs).toHaveBeenCalled();
        });
    });

    test("2. Rendu complet des cartes de statistiques de base", async () => {
        renderComponent();

        expect(screen.getByText("Utilisateurs")).toBeInTheDocument();
        expect(screen.getByText("Médecins")).toBeInTheDocument();
        expect(screen.getByText("Patients")).toBeInTheDocument();

        await waitFor(() => {
            expect(getDocs).toHaveBeenCalled();
        });
    });

    test("3. Rendu des sections d'action de gestion", async () => {
        renderComponent();

        expect(screen.getByText("Gestion des comptes")).toBeInTheDocument();
        expect(screen.getByText("Rapports & Analytics")).toBeInTheDocument();

        await waitFor(() => {
            expect(getDocs).toHaveBeenCalled();
        });
    });
});