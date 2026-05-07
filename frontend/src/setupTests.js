import '@testing-library/jest-dom';
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock('react-router-dom', () => {
    const React = require('react');
    return {
        BrowserRouter: ({ children }) => React.createElement('div', null, children),
        Routes: ({ children }) => React.createElement('div', null, children),
        Route: ({ children }) => React.createElement('div', null, children),
        NavLink: ({ children }) => React.createElement('a', { href: '#' }, children),
        Link: ({ children }) => React.createElement('a', { href: '#' }, children),
        Navigate: () => null,
        useNavigate: () => jest.fn(),
        useLocation: () => ({ pathname: '/' }),
    };
}, { virtual: true });