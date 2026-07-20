export interface VideoRecord {
    id: string;
    title: string;
    source: string;
    topic: string;
    minScore: number;
}

export type QuestionKey = 'stress' | 'anxiety' | 'depression';
