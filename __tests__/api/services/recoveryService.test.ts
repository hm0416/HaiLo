import * as SQLite from 'expo-sqlite';
import { recoveryClient } from '@/api/client/recoveryClient';

// Mock modules BEFORE importing the service
jest.mock('expo-sqlite');
jest.mock('@/api/client/recoveryClient', () => ({
    recoveryClient: {
        mutate: jest.fn(),
        query: jest.fn(),
    },
    SAVE_CHECK_IN: {},
    GET_LAST_CHECK_IN: {},
}));

// Create a mock database instance
const mockDb = {
    execSync: jest.fn(),
    runAsync: jest.fn().mockResolvedValue(undefined),
    getFirstAsync: jest.fn(),
};

// Mock openDatabaseSync to return our mock database
(SQLite.openDatabaseSync as jest.Mock).mockReturnValue(mockDb);

// NOW import the service after mocks are set up
import {
    initDatabase,
    saveCheckIn,
    saveCheckInWithGraphQL,
    getLastCheckIn,
    getLastCheckInWithGraphQL,
    assessRiskLevel,
    getCurrentRiskAssessment,
} from '@/api/services/recoveryService';

// Access the module to reset isInitialized flag between tests
const recoveryServiceModule = require('@/api/services/recoveryService');

describe('recoveryService', () => {
    beforeEach(() => {
        // Reset mock calls but not implementations
        jest.clearAllMocks();

        // Reset the isInitialized flag so database initialization can be tested
        // This is a workaround for testing - in production, initialization happens once
        if (recoveryServiceModule) {
            // Force re-initialization for testing by resetting the module state
            jest.resetModules();
        }
    });

    describe('initDatabase', () => {
        it('should return database instance', async () => {
            const db = await initDatabase();
            expect(db).toBeDefined();
        });

        it('should return database with expected methods', async () => {
            const db = await initDatabase();

            expect(db).toBeDefined();
            expect(db).toHaveProperty('execSync');
            expect(db).toHaveProperty('runAsync');
            expect(db).toHaveProperty('getFirstAsync');
        });
    });

    describe('saveCheckIn', () => {
        it('should insert check-in with correct values', async () => {
            const mockCheckIn = {
                id: 1,
                anxiety: 3,
                stress: 4,
                depression: 2,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            mockDb.getFirstAsync.mockResolvedValue(mockCheckIn);

            const result = await saveCheckIn(3, 4, 2);

            expect(mockDb.runAsync).toHaveBeenCalledWith(
                'INSERT INTO check_ins (anxiety, stress, depression, timestamp) VALUES (?, ?, ?, ?)',
                expect.arrayContaining([3, 4, 2, expect.any(String)])
            );

            expect(result).toEqual(mockCheckIn);
        });

        it('should generate ISO timestamp', async () => {
            const beforeTime = new Date().toISOString();
            await saveCheckIn(1, 2, 3);
            const afterTime = new Date().toISOString();

            const insertCall = mockDb.runAsync.mock.calls[0][1];
            const timestamp = insertCall[3];

            expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
            expect(timestamp >= beforeTime && timestamp <= afterTime).toBe(true);
        });

        it('should return most recent check-in', async () => {
            const mockCheckIn = {
                id: 5,
                anxiety: 1,
                stress: 1,
                depression: 1,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            mockDb.getFirstAsync.mockResolvedValue(mockCheckIn);

            const result = await saveCheckIn(1, 1, 1);

            expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
                'SELECT * FROM check_ins ORDER BY id DESC LIMIT 1'
            );
            expect(result).toEqual(mockCheckIn);
        });
    });

    describe('saveCheckInWithGraphQL', () => {
        it('should save via GraphQL when successful', async () => {
            const mockCheckIn = {
                id: 1,
                anxiety: 3,
                stress: 4,
                depression: 2,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            (recoveryClient.mutate as jest.Mock).mockResolvedValue({
                data: { saveCheckIn: mockCheckIn },
            });

            const result = await saveCheckInWithGraphQL(3, 4, 2);

            expect(recoveryClient.mutate).toHaveBeenCalledWith({
                mutation: expect.any(Object),
                variables: { anxiety: 3, stress: 4, depression: 2 },
            });

            expect(result).toEqual(mockCheckIn);
        });

        it('should fallback to local database when GraphQL fails', async () => {
            const mockCheckIn = {
                id: 1,
                anxiety: 2,
                stress: 3,
                depression: 4,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            (recoveryClient.mutate as jest.Mock).mockRejectedValue(new Error('Network error'));
            mockDb.getFirstAsync.mockResolvedValue(mockCheckIn);

            const result = await saveCheckInWithGraphQL(2, 3, 4);

            expect(console.warn).toHaveBeenCalledWith(
                'GraphQL save check-in failed, using local database',
                expect.any(Error)
            );

            expect(mockDb.runAsync).toHaveBeenCalled();
            expect(result).toEqual(mockCheckIn);
        });

        it('should return null when GraphQL returns no data', async () => {
            (recoveryClient.mutate as jest.Mock).mockResolvedValue({
                data: { saveCheckIn: null },
            });

            const result = await saveCheckInWithGraphQL(1, 2, 3);

            expect(result).toBeNull();
        });
    });

    describe('getLastCheckIn', () => {
        it('should query most recent check-in', async () => {
            const mockCheckIn = {
                id: 10,
                anxiety: 2,
                stress: 3,
                depression: 1,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            mockDb.getFirstAsync.mockResolvedValue(mockCheckIn);

            const result = await getLastCheckIn();

            expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
                'SELECT * FROM check_ins ORDER BY id DESC LIMIT 1'
            );

            expect(result).toEqual(mockCheckIn);
        });

        it('should return null when no check-ins exist', async () => {
            mockDb.getFirstAsync.mockResolvedValue(null);

            const result = await getLastCheckIn();

            expect(result).toBeNull();
        });
    });

    describe('getLastCheckInWithGraphQL', () => {
        it('should get last check-in via GraphQL when successful', async () => {
            const mockCheckIn = {
                id: 5,
                anxiety: 4,
                stress: 3,
                depression: 2,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            (recoveryClient.query as jest.Mock).mockResolvedValue({
                data: { lastCheckIn: mockCheckIn },
            });

            const result = await getLastCheckInWithGraphQL();

            expect(recoveryClient.query).toHaveBeenCalledWith({
                query: expect.any(Object),
            });

            expect(result).toEqual(mockCheckIn);
        });

        it('should fallback to local database when GraphQL fails', async () => {
            const mockCheckIn = {
                id: 7,
                anxiety: 1,
                stress: 2,
                depression: 3,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            (recoveryClient.query as jest.Mock).mockRejectedValue(new Error('Network error'));
            mockDb.getFirstAsync.mockResolvedValue(mockCheckIn);

            const result = await getLastCheckInWithGraphQL();

            expect(console.warn).toHaveBeenCalledWith(
                'GraphQL get last check-in failed, using local database',
                expect.any(Error)
            );

            expect(mockDb.getFirstAsync).toHaveBeenCalled();
            expect(result).toEqual(mockCheckIn);
        });

        it('should return null when GraphQL returns no data', async () => {
            (recoveryClient.query as jest.Mock).mockResolvedValue({
                data: { lastCheckIn: null },
            });

            const result = await getLastCheckInWithGraphQL();

            expect(result).toBeNull();
        });

        it('should handle no check-ins with fallback', async () => {
            (recoveryClient.query as jest.Mock).mockRejectedValue(new Error('Network error'));
            mockDb.getFirstAsync.mockResolvedValue(null);

            const result = await getLastCheckInWithGraphQL();

            expect(result).toBeNull();
        });
    });

    describe('assessRiskLevel', () => {
        describe('High Risk scenarios', () => {
            it('should return high risk when total score >= 12', () => {
                const result = assessRiskLevel(4, 4, 4);

                expect(result.level).toBe('high');
                expect(result.urgency).toBe('immediate');
                expect(result.message).toContain('counselor');
                expect(result.recommendation).toContain('mental health');
            });

            it('should return high risk when 2+ scores >= 4', () => {
                const result = assessRiskLevel(5, 4, 2);

                expect(result.level).toBe('high');
                expect(result.urgency).toBe('immediate');
            });

            it('should return high risk when average >= 4', () => {
                const result = assessRiskLevel(4, 4, 4);

                expect(result.level).toBe('high');
                expect(result.urgency).toBe('immediate');
            });

            it('should return high risk for maximum scores', () => {
                const result = assessRiskLevel(5, 5, 5);

                expect(result.level).toBe('high');
                expect(result.urgency).toBe('immediate');
            });
        });

        describe('Moderate Risk scenarios', () => {
            it('should return moderate risk when total score >= 9', () => {
                const result = assessRiskLevel(3, 3, 3);

                expect(result.level).toBe('moderate');
                expect(result.urgency).toBe('soon');
                expect(result.message).toContain('elevated');
                expect(result.recommendation).toContain('videos');
            });

            it('should return moderate risk when any single score >= 4', () => {
                const result = assessRiskLevel(4, 2, 2);

                expect(result.level).toBe('moderate');
                expect(result.urgency).toBe('soon');
            });

            it('should return moderate risk at threshold (total = 9)', () => {
                const result = assessRiskLevel(3, 3, 3);

                expect(result.level).toBe('moderate');
            });

            it('should return moderate risk with one high score', () => {
                const result = assessRiskLevel(5, 1, 1);

                expect(result.level).toBe('moderate');
            });
        });

        describe('Low Risk scenarios', () => {
            it('should return low risk for minimal scores', () => {
                const result = assessRiskLevel(1, 1, 1);

                expect(result.level).toBe('low');
                expect(result.urgency).toBe('routine');
                expect(result.message).toContain('doing well');
                expect(result.recommendation).toContain('Continue');
            });

            it('should return low risk for below moderate threshold', () => {
                const result = assessRiskLevel(2, 2, 2);

                expect(result.level).toBe('low');
                expect(result.urgency).toBe('routine');
            });

            it('should return low risk with mixed low scores', () => {
                const result = assessRiskLevel(1, 2, 3);

                expect(result.level).toBe('low');
            });
        });

        describe('Edge cases', () => {
            it('should handle boundary with total = 11 and one high score', () => {
                // (3, 4, 3) = total 10, one score >= 4 = moderate
                const result = assessRiskLevel(3, 4, 3);

                expect(result.level).toBe('moderate');
            });

            it('should return high when total = 11 but two high scores', () => {
                // (3, 4, 4) = total 11, but 2 scores >= 4 triggers high risk
                const result = assessRiskLevel(3, 4, 4);

                expect(result.level).toBe('high');
            });

            it('should handle boundary at total = 12', () => {
                const result = assessRiskLevel(4, 4, 4);

                expect(result.level).toBe('high');
            });

            it('should prioritize high scores over total', () => {
                const result = assessRiskLevel(5, 5, 1);

                expect(result.level).toBe('high');
            });
        });
    });

    describe('getCurrentRiskAssessment', () => {
        it('should return risk assessment for last check-in', async () => {
            const mockCheckIn = {
                id: 1,
                anxiety: 4,
                stress: 4,
                depression: 4,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            mockDb.getFirstAsync.mockResolvedValue(mockCheckIn);

            const result = await getCurrentRiskAssessment();

            expect(result).toBeDefined();
            expect(result?.level).toBe('high');
            expect(result?.urgency).toBe('immediate');
        });

        it('should return null when no check-ins exist', async () => {
            mockDb.getFirstAsync.mockResolvedValue(null);

            const result = await getCurrentRiskAssessment();

            expect(result).toBeNull();
        });

        it('should compute correct risk for moderate anxiety', async () => {
            const mockCheckIn = {
                id: 2,
                anxiety: 4,
                stress: 2,
                depression: 2,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            mockDb.getFirstAsync.mockResolvedValue(mockCheckIn);

            const result = await getCurrentRiskAssessment();

            expect(result?.level).toBe('moderate');
            expect(result?.urgency).toBe('soon');
        });

        it('should compute correct risk for low scores', async () => {
            const mockCheckIn = {
                id: 3,
                anxiety: 1,
                stress: 2,
                depression: 1,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            mockDb.getFirstAsync.mockResolvedValue(mockCheckIn);

            const result = await getCurrentRiskAssessment();

            expect(result?.level).toBe('low');
            expect(result?.urgency).toBe('routine');
        });

        it('should fetch most recent check-in', async () => {
            const mockCheckIn = {
                id: 10,
                anxiety: 3,
                stress: 3,
                depression: 3,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            mockDb.getFirstAsync.mockResolvedValue(mockCheckIn);

            await getCurrentRiskAssessment();

            expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
                'SELECT * FROM check_ins ORDER BY id DESC LIMIT 1'
            );
        });
    });
});
