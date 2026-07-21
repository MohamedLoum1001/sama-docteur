import React from "react";
import { render, screen } from "@testing-library/react";
import DashboardLayout from "./DashboardLayout";

// Mock du composant Sidebar pour isoler le Layout
jest.mock("../../pages/admin/sidebar/Sidebar", () => {
    return {
        __esModule: true,
        default: () => (
            <div data-testid="mock-sidebar">
                Sidebar Administrateur
            </div>
        )
    };
});

describe("Tests Unitaires - DashboardLayout", () => {

    const renderComponent = (childrenContent) => {
        return render(<DashboardLayout>{childrenContent}</DashboardLayout>);
    };

    test("1. Rendu structurel global et présence de la Sidebar", () => {
        renderComponent(<div />);

        // Vérification de la présence de la Sidebar mockée
        expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
        expect(screen.getByText("Sidebar Administrateur")).toBeInTheDocument();
    });

    test("2. Injection dynamique et correcte des composants enfants (children)", () => {
        // Rendu avec un nœud enfant spécifique
        renderComponent(
            <div data-testid="test-child">
                <h1>Contenu de l'espace de travail</h1>
                <p>Données du tableau de bord.</p>
            </div>
        );

        // Validation du rendu de l'enfant injecté dans la balise <main>
        const childContainer = screen.getByTestId("test-child");
        expect(childContainer).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Contenu de l'espace de travail" })).toBeInTheDocument();
        expect(screen.getByText("Données du tableau de bord.")).toBeInTheDocument();
    });

    test("3. Application correcte des classes CSS structurelles (Tailwind)", () => {
        const { container } = renderComponent(<div />);

        // Le premier wrapper doit posséder les classes nécessaires à la grille adaptative
        const mainWrapper = container.firstChild;
        expect(mainWrapper).toHaveClass("flex", "h-screen");

        // La balise <main> doit posséder les propriétés de défilement scroll (overflow-y-auto)
        const mainTag = container.querySelector("main");
        expect(mainTag).toHaveClass("flex-1", "overflow-y-auto");
    });
});