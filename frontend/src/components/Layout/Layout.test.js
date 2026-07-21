import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Layout from "./Layout";

// 1. Mock de la Navbar pour isoler le test du Layout
jest.mock("../Navbar/Navbar", () => {
    return {
        __esModule: true,
        default: () => <div data-testid="mock-navbar">Navbar Moked</div>,
    };
});

// 2. Mock de react-router-dom pour contrôler et vérifier le rendu de l'Outlet
jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        Outlet: () => <div data-testid="mock-outlet">Contenu de la Route Enfant</div>,
    };
});

describe("Tests Unitaires - Layout Component", () => {

    const renderLayout = () => {
        return render(
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Layout />
            </BrowserRouter>
        );
    };

    test("1. Doit afficher correctement la Navbar", () => {
        renderLayout();
        const navbarEl = screen.getByTestId("mock-navbar");
        expect(navbarEl).toBeInTheDocument();
    });

    test("2. Doit afficher l'Outlet à l'intérieur de la structure HTML Bootstrap de la carte", () => {
        renderLayout();

        // Vérification de la présence de l'Outlet (le contenu enfant des routes)
        const outletEl = screen.getByTestId("mock-outlet");
        expect(outletEl).toBeInTheDocument();
        expect(screen.getByText("Contenu de la Route Enfant")).toBeInTheDocument();
    });

    test("3. Doit posséder les classes structurales globales et de container Bootstrap", () => {
        const { container } = renderLayout();

        // Vérifie la présence du conteneur principal fluide prenant toute la hauteur
        const mainContainer = container.querySelector(".container-fluid.min-vh-100.d-flex.flex-column");
        expect(mainContainer).toBeInTheDocument();

        // Vérifie la présence de la zone <main> structurée
        const mainSection = container.querySelector("main.flex-grow-1");
        expect(mainSection).toBeInTheDocument();

        // Vérifie l'encapsulation Bootstrap de l'Outlet (card -> card-body)
        const cardBody = container.querySelector(".card.shadow-sm.border-0 .card-body");
        expect(cardBody).toBeInTheDocument();
        expect(cardBody).toContainElement(screen.getByTestId("mock-outlet"));
    });
});