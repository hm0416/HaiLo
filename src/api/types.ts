export interface CheckInRecord {
    id: number;
    anxiety: number;
    stress: number;
    depression: number;
    timestamp: string;
}

export type QuestionKey = 'stress' | 'anxiety' | 'depression';

export interface SummaryBlock {
    tipsAndTricks: string[];
    actionPlan: string[];
}
