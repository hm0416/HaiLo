import {
    saveCheckInController,
    getLastCheckInController,
} from '@/api/controllers/recoveryController';
import * as recoveryService from '@/api/services/recoveryService';

// Mock the service layer
jest.mock('@/api/services/recoveryService', () => ({
    initDatabase: jest.fn().mockResolvedValue({}),
    saveCheckInWithGraphQL: jest.fn(),
    getLastCheckInWithGraphQL: jest.fn(),
}));

describe('recoveryController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('saveCheckInController', () => {
        it('should initialize database before saving', async () => {
            const mockCheckIn = {
                id: 1,
                anxiety: 3,
                stress: 4,
                depression: 2,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            (recoveryService.saveCheckInWithGraphQL as jest.Mock).mockResolvedValue(mockCheckIn);

            await saveCheckInController(3, 4, 2);

            expect(recoveryService.initDatabase).toHaveBeenCalledTimes(1);
        });

        it('should call saveCheckInWithGraphQL with correct parameters', async () => {
            const mockCheckIn = {
                id: 2,
                anxiety: 1,
                stress: 2,
                depression: 3,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            (recoveryService.saveCheckInWithGraphQL as jest.Mock).mockResolvedValue(mockCheckIn);

            const result = await saveCheckInController(1, 2, 3);

            expect(recoveryService.saveCheckInWithGraphQL).toHaveBeenCalledWith(1, 2, 3);
            expect(result).toEqual(mockCheckIn);
        });

        it('should handle all valid mood score values (1-5)', async () => {
            const testCases = [
                [1, 1, 1],
                [2, 3, 4],
                [5, 5, 5],
                [3, 2, 4],
            ];

            for (const [anxiety, stress, depression] of testCases) {
                (recoveryService.saveCheckInWithGraphQL as jest.Mock).mockResolvedValue({
                    id: 1,
                    anxiety,
                    stress,
                    depression,
                    timestamp: '2026-07-20T12:00:00.000Z',
                });

                await saveCheckInController(anxiety, stress, depression);

                expect(recoveryService.saveCheckInWithGraphQL).toHaveBeenCalledWith(
                    anxiety,
                    stress,
                    depression
                );
            }
        });

        it('should propagate errors from service layer', async () => {
            (recoveryService.saveCheckInWithGraphQL as jest.Mock).mockRejectedValue(
                new Error('Database error')
            );

            await expect(saveCheckInController(1, 2, 3)).rejects.toThrow('Database error');
        });

        it('should return null when service returns null', async () => {
            (recoveryService.saveCheckInWithGraphQL as jest.Mock).mockResolvedValue(null);

            const result = await saveCheckInController(1, 2, 3);

            expect(result).toBeNull();
        });
    });

    describe('getLastCheckInController', () => {
        it('should initialize database before fetching', async () => {
            const mockCheckIn = {
                id: 5,
                anxiety: 2,
                stress: 3,
                depression: 1,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            (recoveryService.getLastCheckInWithGraphQL as jest.Mock).mockResolvedValue(mockCheckIn);

            await getLastCheckInController();

            expect(recoveryService.initDatabase).toHaveBeenCalledTimes(1);
        });

        it('should call getLastCheckInWithGraphQL', async () => {
            const mockCheckIn = {
                id: 10,
                anxiety: 4,
                stress: 2,
                depression: 3,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            (recoveryService.getLastCheckInWithGraphQL as jest.Mock).mockResolvedValue(mockCheckIn);

            const result = await getLastCheckInController();

            expect(recoveryService.getLastCheckInWithGraphQL).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockCheckIn);
        });

        it('should return null when no check-ins exist', async () => {
            (recoveryService.getLastCheckInWithGraphQL as jest.Mock).mockResolvedValue(null);

            const result = await getLastCheckInController();

            expect(result).toBeNull();
        });

        it('should propagate errors from service layer', async () => {
            (recoveryService.getLastCheckInWithGraphQL as jest.Mock).mockRejectedValue(
                new Error('Network error')
            );

            await expect(getLastCheckInController()).rejects.toThrow('Network error');
        });

        it('should handle multiple calls correctly', async () => {
            const mockCheckIns = [
                { id: 1, anxiety: 1, stress: 2, depression: 3, timestamp: '2026-07-20T10:00:00.000Z' },
                { id: 2, anxiety: 2, stress: 3, depression: 4, timestamp: '2026-07-20T11:00:00.000Z' },
                { id: 3, anxiety: 3, stress: 4, depression: 5, timestamp: '2026-07-20T12:00:00.000Z' },
            ];

            for (const mockCheckIn of mockCheckIns) {
                (recoveryService.getLastCheckInWithGraphQL as jest.Mock).mockResolvedValue(mockCheckIn);

                const result = await getLastCheckInController();

                expect(result).toEqual(mockCheckIn);
            }

            expect(recoveryService.getLastCheckInWithGraphQL).toHaveBeenCalledTimes(3);
        });
    });

    describe('Controller integration', () => {
        it('should handle save and retrieve flow', async () => {
            const savedCheckIn = {
                id: 1,
                anxiety: 3,
                stress: 4,
                depression: 2,
                timestamp: '2026-07-20T12:00:00.000Z',
            };

            (recoveryService.saveCheckInWithGraphQL as jest.Mock).mockResolvedValue(savedCheckIn);
            (recoveryService.getLastCheckInWithGraphQL as jest.Mock).mockResolvedValue(savedCheckIn);

            // Save a check-in
            const saveResult = await saveCheckInController(3, 4, 2);
            expect(saveResult).toEqual(savedCheckIn);

            // Retrieve the check-in
            const getResult = await getLastCheckInController();
            expect(getResult).toEqual(savedCheckIn);

            expect(recoveryService.initDatabase).toHaveBeenCalledTimes(2);
        });
    });
});
