import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Layout from "./Layout";

// 1. Mock de la Navbar pour isoler le test du Layout Médecin
jest.mock("../Navbar/Navbar", () => {
    return {
        __esModule: true,
        default: () => <div data-testid="mock-navbar">Navbar Médecin Mockée</div>,
    };
});

// 2. Mock de react-router-dom pour isoler et injecter un contenu dans l'Outlet
jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        Outlet: () => <div data-testid="mock-outlet">Espace Médecin - Contenu Enfant</div>,
    };
});

describe("Tests Unitaires - LayoutMedcin Component", () => {

    const renderLayoutMedcin = () => {
        return render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Layout />
            </BrowserRouter>
        );
    };

    test("1. Doit afficher correctement la Navbar du personnel médical", () => {
        renderLayoutMedcin();
        const navbarEl = screen.getByTestId("mock-navbar");
        expect(navbarEl).toBeInTheDocument();
    });

    test("2. Doit afficher le composant Outlet contenant la vue enfant", () => {
        renderLayoutMedcin();

        const outletEl = screen.getByTestId("mock-outlet");
        expect(outletEl).toBeInTheDocument();
        expect(screen.getByText("Espace Médecin - Contenu Enfant")).toBeInTheDocument();
    });

    test("3. Doit posséder la structure de classes CSS Tailwind attendue", () => {
        const { container } = renderLayoutMedcin();

        // Vérifie le conteneur principal flexbox vertical
        const mainContainer = container.querySelector(".min-h-screen.flex.flex-col.bg-gray-100");
        expect(mainContainer).toBeInTheDocument();

        // Vérifie la balise structurelle main avec sa largeur maximale
        const mainSection = container.querySelector("main.flex-1.p-6.max-w-7xl.mx-auto.w-full");
        expect(mainSection).toBeInTheDocument();

        // Vérifie la div enveloppe interne w-full qui contient l'Outlet
        const wrapperDiv = container.querySelector("main > div.w-full");
        expect(wrapperDiv).toBeInTheDocument();
        expect(wrapperDiv).toContainElement(screen.getByTestId("mock-outlet"));
    });
});