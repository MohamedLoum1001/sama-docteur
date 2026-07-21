module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js',
        '^react-router-dom$': '<rootDir>/node_modules/react-router-dom',
    },
    transformIgnorePatterns: [
        "node_modules/(?!(lucide-react|react-router-dom)/)"
    ],
    // Ajoute cette ligne pour masquer le dossier doublon du tableau de couverture
    coveragePathIgnorePatterns: [
        "<rootDir>/src/components/AdminDashboard/"
    ]
};