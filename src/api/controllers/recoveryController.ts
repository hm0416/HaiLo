import { getVideoByTopic, getVideos, initDatabase } from '../services/recoveryService';
import { QuestionKey } from '../types';

export async function loadVideosController() {
    await initDatabase(); // initializes DB before getting videos, double check this 
    return getVideos();
}

export async function getVideoBasedOnScoreController(scores: Record<QuestionKey, number | null>) {
    await initDatabase(); // ensures DB is initialized before fetching videos
    // logic to select video based on score
    // for real use can use the DASS-21 (Depression, Anxiety, and Stress Scales) to determine which videos 

    // made up calculation for sake of excerise 
    // if stress anixety depression >= 3 ---> pick depression video 
    // if stress >= 3 and anxiety >= 3 -> pick stress video 
    // if anxiety >= 3 -> pick anxiety video 

    // using if because evaluating bools, switch good for comparing one val against other cases 
    if (scores.stress !== null && scores.anxiety !== null && scores.depression !== null) {
        if (scores.stress > scores.anxiety && scores.stress > scores.depression) {
            return await getVideoByTopic('stress');
        } else if (scores.anxiety > scores.stress && scores.anxiety > scores.depression) {
            return await getVideoByTopic('anxiety');
        } else if (scores.depression > scores.stress && scores.depression > scores.anxiety) {
            return await getVideoByTopic('depression');
        }
        // figure out other cases 

        // if (scores.stress >= 3 && scores.anxiety >= 3 && scores.depression >= 3) {
        //     return await getVideoByTopic('depression');
        // } else if (scores.stress >= 3 && scores.anxiety >= 3 && scores.depression < 3) {
        //     return await getVideoByTopic('stress');
        // } else if (scores.anxiety >= 3 && scores.stress < 3 && scores.depression < 3) {
        //     return await getVideoByTopic('anxiety');
        // } else if (scores.stress < 3 && scores.anxiety <= 3 && scores.depression >= 3) {
        //     return await getVideoByTopic('depression');
        // } else if (scores.stress >= 3 && scores.anxiety < 3 && scores.depression < 3) {
        //     return await getVideoByTopic('stress');
        // }
    }
    return await getVideoByTopic('anxiety'); // default video if no conditions match
}