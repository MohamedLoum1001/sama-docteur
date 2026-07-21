const jestConfig = require('./jest.config');

describe('Configuration Jest - Validation Structurelle', () => {

    test('1. Doit définir l\'environnement sur jsdom', () => {
        expect(jestConfig.testEnvironment).toBe('jsdom');
    });

    test('2. Doit inclure le fichier de configuration global setupTests', () => {
        expect(jestConfig.setupFilesAfterEnv).toContain('<rootDir>/src/setupTests.js');
    });

    test('3. Doit mapper correctement les fichiers de styles et d\'assets', () => {
        const mappers = jestConfig.moduleNameMapper;

        // Validation du proxy pour les feuilles de style (CSS, SASS, etc.)
        expect(mappers['\\.(css|less|scss|sass)$']).toBe('identity-obj-proxy');

        // Validation du mock de fichiers pour les images, icônes et polices
        expect(mappers['\\.(gif|ttf|eot|svg|png)$']).toBe('<rootDir>/src/__mocks__/fileMock.js');
    });

    test('4. Doit forcer la résolution de react-router-dom', () => {
        expect(jestConfig.moduleNameMapper['^react-router-dom$']).toBe('<rootDir>/node_modules/react-router-dom');
    });

    test('5. Doit configurer transformIgnorePatterns pour inclure lucide-react et react-router-dom', () => {
        expect(jestConfig.transformIgnorePatterns).toBeDefined();
        expect(jestConfig.transformIgnorePatterns[0]).toContain('lucide-react');
        expect(jestConfig.transformIgnorePatterns[0]).toContain('react-router-dom');
    });
});