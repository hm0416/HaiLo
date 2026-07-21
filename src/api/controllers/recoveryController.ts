import {
    initDatabase,
    saveCheckInWithGraphQL,
    getLastCheckInWithGraphQL,
    getCurrentRiskAssessment,
} from '../services/recoveryService';

// Controller to save a mood check-in
export async function saveCheckInController(anxiety: number, stress: number, depression: number) {
    await initDatabase();
    return saveCheckInWithGraphQL(anxiety, stress, depression);
}

// Controller to get the last saved check-in
export async function getLastCheckInController() {
    await initDatabase();
    return getLastCheckInWithGraphQL();
}

// Controller to get current risk assessment
export async function getRiskAssessmentController() {
    await initDatabase();
    return getCurrentRiskAssessment();
}
