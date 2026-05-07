module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    moduleNameMapper: {
        // Gère les imports CSS/Images pour les tests
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js',
        // Force la résolution de react-router-dom
        '^react-router-dom$': '<rootDir>/node_modules/react-router-dom',
    },
    transformIgnorePatterns: [
        "node_modules/(?!(lucide-react|react-router-dom)/)"
    ]
};