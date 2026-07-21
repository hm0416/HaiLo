// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
    openDatabaseSync: jest.fn(() => ({
        execSync: jest.fn(),
        runAsync: jest.fn(),
        getFirstAsync: jest.fn(),
    })),
}));

// Mock Apollo Client
jest.mock('@apollo/client', () => ({
    ...jest.requireActual('@apollo/client'),
    ApolloClient: jest.fn(() => ({
        query: jest.fn(),
        mutate: jest.fn(),
    })),
}));

// Silence console warnings in tests
global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
};
