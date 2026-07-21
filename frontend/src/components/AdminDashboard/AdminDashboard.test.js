import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";


// Mock DashboardLayout pour isoler le composant
jest.mock("./DashboardLayout", () => {
    return ({ children }) => (
        <div data-testid="dashboard-layout">
            {children}
        </div>
    );
});


// Mock lucide-react
jest.mock("lucide-react", () => ({
    Users: () => <svg data-testid="users-icon" />,
    UserCheck: () => <svg data-testid="usercheck-icon" />,
    Calendar: () => <svg data-testid="calendar-icon" />,
    CreditCard: () => <svg data-testid="creditcard-icon" />,
    Activity: () => <svg data-testid="activity-icon" />,
    Stethoscope: () => <svg data-testid="stethoscope-icon" />,
}));


describe("AdminDashboard - Tests unitaires", () => {


    test("1. Rend correctement le DashboardLayout", () => {

        render(
            <AdminDashboard />
        );


        expect(
            screen.getByTestId("dashboard-layout")
        )
            .toBeInTheDocument();

    });



    test("2. Affiche le titre du dashboard admin", () => {


        render(
            <AdminDashboard />
        );


        expect(
            screen.getByText(
                "Tableau de bord Admin"
            )
        )
            .toBeInTheDocument();


    });



    test("3. Affiche le message de bienvenue", () => {


        render(
            <AdminDashboard />
        );


        expect(
            screen.getByText(
                "Bienvenue sur votre espace de gestion SamaDocteur."
            )
        )
            .toBeInTheDocument();


    });



    test("4. Affiche toutes les cartes statistiques", () => {


        render(
            <AdminDashboard />
        );


        expect(
            screen.getByText(
                "Total Utilisateurs"
            )
        )
            .toBeInTheDocument();


        expect(
            screen.getByText(
                "Médecins Validés"
            )
        )
            .toBeInTheDocument();


        expect(
            screen.getByText(
                "Rendez-vous"
            )
        )
            .toBeInTheDocument();


        expect(
            screen.getByText(
                "Revenus (Mensuel)"
            )
        )
            .toBeInTheDocument();


    });



    test("5. Affiche les valeurs des statistiques", () => {


        render(
            <AdminDashboard />
        );


        expect(
            screen.getByText("1,254")
        )
            .toBeInTheDocument();


        expect(
            screen.getByText("482")
        )
            .toBeInTheDocument();


        expect(
            screen.getByText("8,940")
        )
            .toBeInTheDocument();


        expect(
            screen.getByText("12,450€")
        )
            .toBeInTheDocument();


    });



    test("6. Affiche les icônes statistiques", () => {


        render(
            <AdminDashboard />
        );


        expect(
            screen.getByTestId("users-icon")
        )
            .toBeInTheDocument();


        expect(
            screen.getByTestId("usercheck-icon")
        )
            .toBeInTheDocument();


        expect(
            screen.getByTestId("calendar-icon")
        )
            .toBeInTheDocument();


        expect(
            screen.getByTestId("creditcard-icon")
        )
            .toBeInTheDocument();


    });



    test("7. Affiche la section activité inscriptions", () => {


        render(
            <AdminDashboard />
        );


        expect(
            screen.getByText(
                "Activité des inscriptions"
            )
        )
            .toBeInTheDocument();


    });



    test("8. Affiche le graphique placeholder", () => {


        render(
            <AdminDashboard />
        );


        expect(
            screen.getByText(
                "[ Espace pour un Graphique Chart.js / Recharts ]"
            )
        )
            .toBeInTheDocument();


    });



    test("9. Affiche le select période", () => {


        render(
            <AdminDashboard />
        );


        const select =
            screen.getByRole("combobox");


        expect(select)
            .toBeInTheDocument();


        expect(
            screen.getByText(
                "7 derniers jours"
            )
        )
            .toBeInTheDocument();


        expect(
            screen.getByText(
                "30 derniers jours"
            )
        )
            .toBeInTheDocument();


    });



    test("10. Affiche la liste des médecins à valider", () => {


        render(
            <AdminDashboard />
        );


        expect(
            screen.getByText(
                "Médecins à valider"
            )
        )
            .toBeInTheDocument();



        const doctors =
            screen.getAllByText(
                "Dr. Jean Dupont"
            );


        expect(doctors)
            .toHaveLength(4);


    });



    test("11. Affiche les spécialités médecins", () => {


        render(
            <AdminDashboard />
        );


        const specialities =
            screen.getAllByText(
                "Cardiologue"
            );


        expect(
            specialities
        )
            .toHaveLength(4);


    });



    test("12. Affiche le bouton Voir toutes les demandes", () => {


        render(
            <AdminDashboard />
        );


        expect(
            screen.getByText(
                "Voir toutes les demandes"
            )
        )
            .toBeInTheDocument();


    });



    test("13. Le bouton Voir toutes les demandes est cliquable", () => {


        render(
            <AdminDashboard />
        );


        const button =
            screen.getByText(
                "Voir toutes les demandes"
            );


        expect(button)
            .not
            .toBeDisabled();


        fireEvent.click(button);


    });



    test("14. Vérifie la présence des 4 cartes statistiques", () => {


        render(
            <AdminDashboard />
        );


        const cards =
            document.querySelectorAll(
                ".rounded-2xl"
            );


        expect(cards.length)
            .toBeGreaterThanOrEqual(5);


    });



    test("15. Vérifie le rendu sans erreur", () => {


        expect(() =>
            render(
                <AdminDashboard />
            )
        )
            .not
            .toThrow();


    });


});