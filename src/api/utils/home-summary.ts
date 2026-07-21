import { SummaryBlock } from '@/api/types';

// called in the index file to load video summaries
export async function loadVideoSummaries(): Promise<Record<string, SummaryBlock>> {
    try {
        const module = await import('../../../scripts/video-summaries.json');
        return module.default ?? module;  // the loaded video summaries 
    } catch (error) {
        console.warn('Could not load video summaries cache', error);
        return {};
    }
}
export { SummaryBlock };

