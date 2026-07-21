import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import IncomingCallModal from "./IncomingCallModal";

describe("IncomingCallModal - Couverture 100%", () => {
    const mockCallData = {
        callerName: "Dr House",
    };
    const mockOnAccept = jest.fn();
    const mockOnReject = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    function renderModal(props = {}) {
        return render(
            <IncomingCallModal
                callData={mockCallData}
                onAccept={mockOnAccept}
                onReject={mockOnReject}
                {...props}
            />
        );
    }

    test("1. affiche correctement les informations de l'appelant", () => {
        renderModal();

        // Vérification du nom de l'appelant
        expect(screen.getByText("Dr House")).toBeInTheDocument();
        expect(screen.getByText("Appel vidéo entrant...")).toBeInTheDocument();

        // Vérification de l'avatar et de sa source URL
        const avatarImg = screen.getByAltText("caller");
        expect(avatarImg).toBeInTheDocument();
        expect(avatarImg).toHaveAttribute(
            "src",
            "https://ui-avatars.com/api/?name=Dr House&background=00a5a8&color=fff"
        );
    });

    test("2. déclenche onAccept lors du clic sur le bouton accepter", () => {
        renderModal();

        // Cibler le bouton via sa classe CSS d'acceptation
        const acceptButton = document.querySelector(".btn-call.accept");
        expect(acceptButton).toBeInTheDocument();

        fireEvent.click(acceptButton);
        expect(mockOnAccept).toHaveBeenCalledTimes(1);
        expect(mockOnReject).not.toHaveBeenCalled();
    });

    test("3. déclenche onReject lors du clic sur le bouton rejeter", () => {
        renderModal();

        // Cibler le bouton via sa classe CSS de rejet
        const rejectButton = document.querySelector(".btn-call.reject");
        expect(rejectButton).toBeInTheDocument();

        fireEvent.click(rejectButton);
        expect(mockOnReject).toHaveBeenCalledTimes(1);
        expect(mockOnAccept).not.toHaveBeenCalled();
    });

    test("4. charge et configure correctement la sonnerie audio", () => {
        renderModal();

        // Vérification de la balise audio cachée pour la sonnerie
        const audioEl = document.querySelector("audio");
        expect(audioEl).toBeInTheDocument();
        expect(audioEl).toHaveAttribute("src", "/assets/sounds/ringtone.mp3");
        expect(audioEl).toHaveAttribute("autoplay");
        expect(audioEl).toHaveAttribute("loop");
    });
});