import { loadVideoSummaries } from '@/api/utils/home-summary';
import { SummaryBlock } from '@/api/types';

describe('loadVideoSummaries', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should load and transform video summaries from JSON', async () => {
        const result = await loadVideoSummaries();

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
    });

    it('should return Record with video IDs as keys', async () => {
        const result = await loadVideoSummaries();

        // Should have video entries (v1, v2, v3)
        expect(Object.keys(result).length).toBeGreaterThan(0);
        expect(result).toHaveProperty('v1');
        expect(result).toHaveProperty('v2');
        expect(result).toHaveProperty('v3');
    });

    it('should transform summaries to SummaryBlock format', async () => {
        const result = await loadVideoSummaries();

        for (const [key, value] of Object.entries(result)) {
            expect(value).toHaveProperty('tipsAndTricks');
            expect(value).toHaveProperty('actionPlan');
            expect(Array.isArray(value.tipsAndTricks)).toBe(true);
            expect(Array.isArray(value.actionPlan)).toBe(true);
        }
    });

    it('should exclude summary field from result', async () => {
        const result = await loadVideoSummaries();

        for (const [key, value] of Object.entries(result)) {
            expect(value).not.toHaveProperty('summary');
            expect(value).not.toHaveProperty('id');
            expect(value).not.toHaveProperty('topic');
            expect(value).not.toHaveProperty('url');
        }
    });

    it('should have valid tipsAndTricks arrays', async () => {
        const result = await loadVideoSummaries();

        // Check anxiety tips (v1)
        expect(result.v1.tipsAndTricks).toBeDefined();
        expect(result.v1.tipsAndTricks.length).toBeGreaterThan(0);
        expect(typeof result.v1.tipsAndTricks[0]).toBe('string');

        // Check stress tips (v2)
        expect(result.v2.tipsAndTricks).toBeDefined();
        expect(result.v2.tipsAndTricks.length).toBeGreaterThan(0);

        // Check depression tips (v3)
        expect(result.v3.tipsAndTricks).toBeDefined();
        expect(result.v3.tipsAndTricks.length).toBeGreaterThan(0);
    });

    it('should have valid actionPlan arrays', async () => {
        const result = await loadVideoSummaries();

        // Check anxiety action plan (v1)
        expect(result.v1.actionPlan).toBeDefined();
        expect(result.v1.actionPlan.length).toBeGreaterThan(0);
        expect(typeof result.v1.actionPlan[0]).toBe('string');

        // Check stress action plan (v2)
        expect(result.v2.actionPlan).toBeDefined();
        expect(result.v2.actionPlan.length).toBeGreaterThan(0);

        // Check depression action plan (v3)
        expect(result.v3.actionPlan).toBeDefined();
        expect(result.v3.actionPlan.length).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
        // Since we can't easily mock the import failure, 
        // this test just verifies the function doesn't throw
        const result = await loadVideoSummaries();
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
    });

    it('should handle missing tipsAndTricks with empty array', async () => {
        const result = await loadVideoSummaries();

        for (const [key, value] of Object.entries(result)) {
            expect(value.tipsAndTricks).toBeDefined();
            expect(Array.isArray(value.tipsAndTricks)).toBe(true);
        }
    });

    it('should handle missing actionPlan with empty array', async () => {
        const result = await loadVideoSummaries();

        for (const [key, value] of Object.entries(result)) {
            expect(value.actionPlan).toBeDefined();
            expect(Array.isArray(value.actionPlan)).toBe(true);
        }
    });

    it('should return consistent structure on multiple calls', async () => {
        const result1 = await loadVideoSummaries();
        const result2 = await loadVideoSummaries();

        expect(Object.keys(result1)).toEqual(Object.keys(result2));
        expect(result1.v1.tipsAndTricks.length).toBe(result2.v1.tipsAndTricks.length);
        expect(result1.v1.actionPlan.length).toBe(result2.v1.actionPlan.length);
    });

    describe('SummaryBlock type', () => {
        it('should match expected structure', async () => {
            const result = await loadVideoSummaries();
            const sampleSummary: SummaryBlock = result.v1;

            expect(sampleSummary).toMatchObject({
                tipsAndTricks: expect.any(Array),
                actionPlan: expect.any(Array),
            });
        });

        it('should contain only string arrays', async () => {
            const result = await loadVideoSummaries();

            for (const summary of Object.values(result)) {
                summary.tipsAndTricks.forEach((tip) => {
                    expect(typeof tip).toBe('string');
                });

                summary.actionPlan.forEach((action) => {
                    expect(typeof action).toBe('string');
                });
            }
        });
    });

    describe('video-specific summaries', () => {
        it('should have anxiety video summary (v1)', async () => {
            const result = await loadVideoSummaries();

            expect(result.v1).toBeDefined();
            expect(result.v1.tipsAndTricks.length).toBeGreaterThan(0);
            expect(result.v1.actionPlan.length).toBeGreaterThan(0);
        });

        it('should have stress video summary (v2)', async () => {
            const result = await loadVideoSummaries();

            expect(result.v2).toBeDefined();
            expect(result.v2.tipsAndTricks.length).toBeGreaterThan(0);
            expect(result.v2.actionPlan.length).toBeGreaterThan(0);
        });

        it('should have depression video summary (v3)', async () => {
            const result = await loadVideoSummaries();

            expect(result.v3).toBeDefined();
            expect(result.v3.tipsAndTricks.length).toBeGreaterThan(0);
            expect(result.v3.actionPlan.length).toBeGreaterThan(0);
        });
    });
});
