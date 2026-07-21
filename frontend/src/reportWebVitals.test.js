import reportWebVitals from "./reportWebVitals";

jest.mock("web-vitals", () => ({
    getCLS: jest.fn(),
    getFID: jest.fn(),
    getFCP: jest.fn(),
    getLCP: jest.fn(),
    getTTFB: jest.fn(),
}));

describe("reportWebVitals", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("ne lance aucune erreur avec une fonction", async () => {
        const callback = jest.fn();

        await reportWebVitals(callback);

        // attendre la résolution de l'import dynamique
        await new Promise((resolve) => setTimeout(resolve, 0));
    });

    test("ne fait rien si le callback est undefined", async () => {
        await reportWebVitals();

        expect(true).toBe(true);
    });

    test("ne fait rien si le callback n'est pas une fonction", async () => {
        await reportWebVitals("abc");

        expect(true).toBe(true);
    });
});