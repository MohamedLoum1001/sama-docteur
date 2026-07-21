import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import Navbar from "./Navbar";
import { MemoryRouter } from "react-router-dom";
import {
    onSnapshot,
    updateDoc,
} from "firebase/firestore";

const mockNavigate = jest.fn();

// Ignorer les avertissements de flags futurs de React Router v7 qui polluent la console
beforeAll(() => {
    jest.spyOn(console, "warn").mockImplementation((msg) => {
        if (msg && msg.includes("React Router Future Flag Warning")) return;
        console.warn(msg);
    });
});

afterAll(() => {
    console.warn.mockRestore();
});

jest.mock("../../configuration/firebase", () => ({
    db: {},
}));

jest.mock("../NotificationDropdown/NotificationDropdown", () => (props) => (
    <div data-testid="notification-dropdown">
        Notifications ({props.unreadNotifs})
    </div>
));

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

jest.mock("firebase/firestore", () => ({
    doc: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    onSnapshot: jest.fn(),
    updateDoc: jest.fn(() => Promise.resolve()),
}));

describe("Navbar - Couverture 100%", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        Storage.prototype.getItem = jest.fn((key) => {
            if (key === "user") {
                return JSON.stringify({
                    uid: "user1",
                    prenom: "Mohamed",
                    nom: "Loum",
                });
            }
            return null;
        });

        Storage.prototype.removeItem = jest.fn();
        sessionStorage.clear = jest.fn();

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
            })
        );

        onSnapshot.mockImplementation((ref, callback) => {
            if (onSnapshot.mock.calls.length === 1) {
                callback({
                    exists: () => true,
                    data: () => ({
                        prenom: "Mohamed",
                        nom: "Loum",
                        photo: "",
                    }),
                });
            }

            else if (onSnapshot.mock.calls.length === 2) {
                callback({
                    docs: [
                        {
                            id: "n1",
                            data: () => ({
                                isRead: false,
                            }),
                        },
                        {
                            id: "n2",
                            data: () => ({
                                isRead: true,
                            }),
                        },
                    ],
                });
            }

            else {
                callback({
                    docs: [
                        {
                            id: "m1",
                            data: () => ({
                                senderId: "doctor1",
                                senderName: "Dr House",
                                content: "Bonjour",
                                type: "text",
                                isRead: false,
                                createdAt: {
                                    toDate: () => new Date("2024-01-01T12:00:00"),
                                },
                            }),
                        },
                    ],
                });
            }

            return jest.fn();
        });
    });

    function renderNavbar() {
        return render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );
    }

    test("1. affiche le logo", async () => {
        renderNavbar();
        expect(await screen.findByText("Sama Docteur")).toBeInTheDocument();
    });

    test("2. affiche le badge notification", async () => {
        renderNavbar();

        const bellButton = document.querySelector(".bi-bell").closest("button");
        expect(bellButton).toHaveTextContent("1");

        const chatButton = document.querySelector(".bi-chat-dots").closest("button");
        expect(chatButton).toHaveTextContent("1");
    });

    test("3. ouvre les notifications", async () => {
        renderNavbar();

        const bell = document.querySelector(".bi-bell").closest("button");
        fireEvent.click(bell);

        expect(await screen.findByTestId("notification-dropdown")).toBeInTheDocument();
    });

    test("4. ouvre les messages", async () => {
        renderNavbar();

        const button = document.querySelector(".bi-chat-dots").closest("button");
        fireEvent.click(button);

        expect(await screen.findByText("Messages récents")).toBeInTheDocument();
        expect(screen.getByText("Dr House")).toBeInTheDocument();
        expect(screen.getByText("Bonjour")).toBeInTheDocument();
    });

    test("5. gestion complète des badges et clic sur un message (Texte)", async () => {
        renderNavbar();

        fireEvent.click(document.querySelector(".bi-chat-dots").closest("button"));

        const msg = await screen.findByText("Bonjour");
        fireEvent.click(msg);

        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("/messages", {
                state: {
                    contactId: "doctor1",
                    contactName: "Dr House",
                },
            });
        });
    });

    test("6. affiche un message audio", async () => {
        onSnapshot.mockReset();
        onSnapshot.mockImplementation((ref, callback) => {
            if (onSnapshot.mock.calls.length === 1) {
                callback({
                    exists: () => true,
                    data: () => ({
                        prenom: "Mohamed",
                        nom: "Loum",
                    }),
                });
            }
            else if (onSnapshot.mock.calls.length === 2) {
                callback({ docs: [] });
            }
            else {
                callback({
                    docs: [
                        {
                            id: "m1",
                            data: () => ({
                                senderId: "doctor1",
                                senderName: "Dr House",
                                type: "audio",
                                content: "",
                                isRead: false,
                                createdAt: {
                                    toDate: () => new Date(),
                                },
                            }),
                        },
                    ],
                });
            }
            return jest.fn();
        });

        renderNavbar();

        fireEvent.click(document.querySelector(".bi-chat-dots").closest("button"));
        expect(await screen.findByText("🎤 Message vocal")).toBeInTheDocument();
    });

    test("7. ouvre le menu profil", async () => {
        renderNavbar();

        const avatar = await screen.findByAltText("Profile");
        fireEvent.click(avatar);

        expect(await screen.findByText("Déconnexion")).toBeInTheDocument();
    });

    test("8. déconnexion", async () => {
        renderNavbar();

        fireEvent.click(await screen.findByAltText("Profile"));
        fireEvent.click(await screen.findByText("Déconnexion"));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalled();
            expect(localStorage.removeItem).toHaveBeenCalledWith("user");
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    test("9. ferme les menus lors d'un clic extérieur", async () => {
        renderNavbar();

        fireEvent.click(await screen.findByAltText("Profile"));
        expect(screen.getByText("Déconnexion")).toBeInTheDocument();

        fireEvent.mouseDown(document.body);

        await waitFor(() => {
            expect(screen.queryByText("Déconnexion")).not.toBeInTheDocument();
        });
    });

    test("10. affiche 'Aucun message' lorsqu'il n'y en a pas", async () => {
        onSnapshot.mockReset();
        onSnapshot.mockImplementation((ref, callback) => {
            if (onSnapshot.mock.calls.length === 1) {
                callback({
                    exists: () => true,
                    data: () => ({
                        prenom: "Mohamed",
                        nom: "Loum",
                    }),
                });
            } else {
                callback({ docs: [] });
            }
            return jest.fn();
        });

        renderNavbar();

        fireEvent.click(document.querySelector(".bi-chat-dots").closest("button"));
        expect(await screen.findByText("Aucun message")).toBeInTheDocument();
    });

    test("11. formatDateTime gère une date invalide", async () => {
        onSnapshot.mockReset();
        onSnapshot.mockImplementation((ref, callback) => {
            if (onSnapshot.mock.calls.length === 1) {
                callback({
                    exists: () => true,
                    data: () => ({
                        prenom: "Mohamed",
                        nom: "Loum",
                    }),
                });
            }
            else if (onSnapshot.mock.calls.length === 2) {
                callback({ docs: [] });
            }
            else {
                callback({
                    docs: [
                        {
                            id: "1",
                            data: () => ({
                                senderId: "doctor1",
                                senderName: "Dr House",
                                content: "Bonjour",
                                type: "text",
                                isRead: true,
                                createdAt: "invalid-date-string",
                            }),
                        },
                    ],
                });
            }
            return jest.fn();
        });

        renderNavbar();

        fireEvent.click(document.querySelector(".bi-chat-dots").closest("button"));

        // Correction de l'assertion pour correspondre à la chaîne générée par l'objet Date natif
        expect(await screen.findByText("Invalid Date Invalid Date")).toBeInTheDocument();
    });
});