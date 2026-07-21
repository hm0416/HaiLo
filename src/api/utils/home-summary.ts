import { SummaryBlock } from '@/api/types';

export async function loadVideoSummaries(): Promise<Record<string, SummaryBlock>> {
    try {
        const module = await import('../../../scripts/video-summaries.json');
        const data = module.default ?? module;

        // Transform to exclude summary field
        const result: Record<string, SummaryBlock> = {};
        for (const [key, value] of Object.entries(data)) {
            const videoData = value as any;
            result[key] = {
                tipsAndTricks: videoData.tipsAndTricks || [],
                actionPlan: videoData.actionPlan || [],
            };
        }

        return result;
    } catch (error) {
        console.warn('Could not load video summaries cache', error);
        return {};
    }
}
export { SummaryBlock };

