import React from 'react';

// ================================
// Mocks des fichiers CSS
// ================================
jest.mock('./index.css', () => ({}));
jest.mock('bootstrap/dist/css/bootstrap.min.css', () => ({}));

// ================================
// Mock du composant App
// ================================
jest.mock('./App', () => () => (
    <div data-testid="mock-app">Mock App</div>
));

// ================================
// Mock de BrowserRouter
// ================================
jest.mock('react-router-dom', () => ({
    BrowserRouter: ({ children }) => children,
}));

// ================================
// Mock de ReactDOM.createRoot
// ================================
const mockRender = jest.fn();

const mockCreateRoot = jest.fn(() => ({
    render: mockRender,
}));

jest.mock('react-dom/client', () => ({
    __esModule: true,
    default: {
        createRoot: mockCreateRoot,
    },
    createRoot: mockCreateRoot,
}));

describe('Application Root Initialization', () => {

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();

        document.body.innerHTML = `
            <div id="root"></div>
        `;
    });

    test("Doit initialiser createRoot sur l'élément HTML #root et appeler render", () => {

        require('./index');

        expect(mockCreateRoot).toHaveBeenCalledTimes(1);

        expect(mockCreateRoot).toHaveBeenCalledWith(
            document.getElementById('root')
        );

        expect(mockRender).toHaveBeenCalledTimes(1);
    });

});