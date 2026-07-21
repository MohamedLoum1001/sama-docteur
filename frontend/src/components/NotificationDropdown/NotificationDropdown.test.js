import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotificationDropdown from "./NotificationDropdown";

import {
    doc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    writeBatch,
} from "firebase/firestore";

import { db } from "../../configuration/firebase";


// =======================
// MOCK FIREBASE
// =======================

jest.mock("firebase/firestore", () => ({
    doc: jest.fn(),
    updateDoc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
    writeBatch: jest.fn(),
}));

jest.mock("../../configuration/firebase", () => ({
    db: {},
}));


describe("NotificationDropdown - Tests unitaires", () => {

    const formatDateTime = jest.fn(() => "17/07/2026 12:00");


    beforeEach(() => {
        jest.clearAllMocks();

        localStorage.clear();

        writeBatch.mockReturnValue({
            update: jest.fn(),
            commit: jest.fn().mockResolvedValue(),
        });
    });


    // =====================================
    // AFFICHAGE GENERAL
    // =====================================

    test("1. Affiche le titre Notifications", () => {

        render(
            <NotificationDropdown
                notifications={[]}
                unreadNotifs={0}
                formatDateTime={formatDateTime}
            />
        );


        expect(
            screen.getByText("Notifications")
        ).toBeInTheDocument();

    });



    // =====================================
    // CAS AUCUNE NOTIFICATION
    // =====================================

    test("2. Affiche message aucune notification", () => {

        render(
            <NotificationDropdown
                notifications={[]}
                unreadNotifs={0}
                formatDateTime={formatDateTime}
            />
        );


        expect(
            screen.getByText("Aucune notification")
        ).toBeInTheDocument();

    });



    // =====================================
    // BADGE NON LUS
    // =====================================

    test("3. Affiche le badge des notifications non lues", () => {

        render(
            <NotificationDropdown
                notifications={[]}
                unreadNotifs={5}
                formatDateTime={formatDateTime}
            />
        );


        expect(
            screen.getByText("5 nouvelles")
        ).toBeInTheDocument();

    });



    // =====================================
    // AFFICHAGE NOTIFICATIONS
    // =====================================


    test("4. Affiche une notification lue", () => {


        const notifications = [
            {
                id: "1",
                message: "Votre rendez-vous est confirmé",
                isRead: true,
                createdAt: new Date()
            }
        ];


        render(
            <NotificationDropdown
                notifications={notifications}
                unreadNotifs={0}
                formatDateTime={formatDateTime}
            />
        );


        expect(
            screen.getByText(
                "Votre rendez-vous est confirmé"
            )
        ).toBeInTheDocument();


        expect(
            formatDateTime
        ).toHaveBeenCalled();

    });



    test("5. Affiche une notification non lue avec indicateur bleu", () => {


        const notifications = [
            {
                id: "2",
                message: "Nouvelle ordonnance disponible",
                isRead: false,
                createdAt: new Date()
            }
        ];


        const { container } = render(
            <NotificationDropdown
                notifications={notifications}
                unreadNotifs={1}
                formatDateTime={formatDateTime}
            />
        );


        expect(
            screen.getByText(
                "Nouvelle ordonnance disponible"
            )
        ).toBeInTheDocument();


        expect(
            container.querySelector(".bg-primary")
        ).toBeTruthy();

    });



    // =====================================
    // FORMAT DATE
    // =====================================


    test("6. Appelle formatDateTime avec la bonne date", () => {


        const date = "2026-07-17";


        render(
            <NotificationDropdown
                notifications={[
                    {
                        id: "3",
                        message: "Test date",
                        isRead: false,
                        createdAt: date
                    }
                ]}
                unreadNotifs={1}
                formatDateTime={formatDateTime}
            />
        );


        expect(
            formatDateTime
        ).toHaveBeenCalledWith(date);


    });



    // =====================================
    // CLICK NOTIFICATION NON LUE
    // =====================================


    test("7. Marque une notification comme lue au clic", async () => {


        doc.mockReturnValue("notification-ref");


        render(
            <NotificationDropdown
                notifications={[
                    {
                        id: "notif1",
                        message: "Clique moi",
                        isRead: false,
                        createdAt: new Date()
                    }
                ]}
                unreadNotifs={1}
                formatDateTime={formatDateTime}
            />
        );


        fireEvent.click(
            screen.getByText("Clique moi")
        );


        await waitFor(() => {

            expect(updateDoc)
                .toHaveBeenCalledWith(
                    "notification-ref",
                    {
                        isRead: true
                    }
                );

        });


    });



    // =====================================
    // CLICK NOTIFICATION DEJA LUE
    // =====================================


    test("8. Ne fait rien au clic sur une notification déjà lue", () => {


        render(
            <NotificationDropdown
                notifications={[
                    {
                        id: "notif2",
                        message: "Déjà lu",
                        isRead: true,
                        createdAt: new Date()
                    }
                ]}
                unreadNotifs={0}
                formatDateTime={formatDateTime}
            />
        );


        fireEvent.click(
            screen.getByText("Déjà lu")
        );


        expect(updateDoc)
            .not
            .toHaveBeenCalled();


    });



    // =====================================
    // BOUTON TOUT MARQUER COMME LU
    // =====================================


    test("9. Affiche le bouton Tout marquer comme lu", () => {


        render(
            <NotificationDropdown
                notifications={[
                    {
                        id: "1",
                        message: "Notif",
                        isRead: false,
                        createdAt: new Date()
                    }
                ]}
                unreadNotifs={1}
                formatDateTime={formatDateTime}
            />
        );


        expect(
            screen.getByText(
                "Tout marquer comme lu"
            )
        ).toBeInTheDocument();


    });



    // =====================================
    // MARK ALL AS READ
    // =====================================


    test("10. Marque toutes les notifications comme lues", async () => {


        localStorage.setItem(
            "user",
            JSON.stringify({
                uid: "user123"
            })
        );


        const batchUpdate = jest.fn();

        const batchCommit = jest
            .fn()
            .mockResolvedValue();


        writeBatch.mockReturnValue({
            update: batchUpdate,
            commit: batchCommit
        });


        getDocs.mockResolvedValue({

            forEach(callback) {

                callback({
                    id: "notif1"
                });

                callback({
                    id: "notif2"
                });

            }

        });


        doc.mockReturnValue(
            "doc-reference"
        );


        render(
            <NotificationDropdown
                notifications={[
                    {
                        id: "notif",
                        message: "Test",
                        isRead: false,
                        createdAt: new Date()
                    }
                ]}
                unreadNotifs={1}
                formatDateTime={formatDateTime}
            />
        );



        fireEvent.click(
            screen.getByText(
                "Tout marquer comme lu"
            )
        );



        await waitFor(() => {


            expect(getDocs)
                .toHaveBeenCalled();


            expect(batchUpdate)
                .toHaveBeenCalledTimes(2);


            expect(batchCommit)
                .toHaveBeenCalled();


        });


    });



    // =====================================
    // USER ABSENT
    // =====================================


    test("11. Ne fait rien si aucun utilisateur connecté", async () => {


        render(
            <NotificationDropdown
                notifications={[
                    {
                        id: "1",
                        message: "Notif",
                        isRead: false,
                        createdAt: new Date()
                    }
                ]}
                unreadNotifs={1}
                formatDateTime={formatDateTime}
            />
        );


        fireEvent.click(
            screen.getByText(
                "Tout marquer comme lu"
            )
        );


        await waitFor(() => {

            expect(getDocs)
                .not
                .toHaveBeenCalled();

        });


    });



    // =====================================
    // ERREUR FIREBASE
    // =====================================


    test("12. Gère une erreur Firebase lors du marquage", async () => {


        localStorage.setItem(
            "user",
            JSON.stringify({
                uid: "user123"
            })
        );


        const consoleSpy =
            jest.spyOn(console, "error")
                .mockImplementation(() => { });


        getDocs.mockRejectedValue(
            new Error("Firebase error")
        );


        render(
            <NotificationDropdown
                notifications={[
                    {
                        id: "1",
                        message: "Erreur test",
                        isRead: false,
                        createdAt: new Date()
                    }
                ]}
                unreadNotifs={1}
                formatDateTime={formatDateTime}
            />
        );



        fireEvent.click(
            screen.getByText(
                "Tout marquer comme lu"
            )
        );


        await waitFor(() => {


            expect(consoleSpy)
                .toHaveBeenCalled();


        });


        consoleSpy.mockRestore();

    });


});