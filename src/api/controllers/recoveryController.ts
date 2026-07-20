import {
    initDatabase,
    saveCheckInWithGraphQL,
    getLastCheckInWithGraphQL
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
