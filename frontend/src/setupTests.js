import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import '@testing-library/jest-dom';

// nettoyage global des timers
afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
});

// Mock Agora (On mock l'objet par défaut ET les fonctions)
jest.mock('agora-rtc-react', () => ({
    __esModule: true,
    default: {
        createClient: jest.fn(() => ({
            join: jest.fn(),
            leave: jest.fn(),
            on: jest.fn(),
            publish: jest.fn(),
        })),
    },
    useRTCClient: jest.fn(),
    useLocalMicrophoneTrack: () => ({ isLoading: false }),
    useLocalCameraTrack: () => ({ isLoading: false }),
    useJoin: jest.fn(),
    useRemoteUsers: () => [],
    LocalVideoTrack: () => <div />,
    RemoteVideoTrack: () => <div />,
}));