// centralized place for all types 

// saves the users response values 
export interface CheckInRecord {
    id: number;
    anxiety: number;
    stress: number;
    depression: number;
    timestamp: string;
}

// keys for the different questions 
export type QuestionKey = 'stress' | 'anxiety' | 'depression';

// structure for the AI analysis 
export interface SummaryBlock {
    tipsAndTricks: string[];
    actionPlan: string[];
}
