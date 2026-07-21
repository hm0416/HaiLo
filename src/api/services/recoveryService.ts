import * as SQLite from 'expo-sqlite';
import { GET_LAST_CHECK_IN, SAVE_CHECK_IN, recoveryClient } from '../client/recoveryClient';
import type { CheckInRecord } from '@/api/types';

const db = SQLite.openDatabaseSync('hailo.db'); // creates DB

let isInitialized = false;

export async function initDatabase() {
  // Only initialize once to prevent dropping tables on every call
  if (isInitialized) {
    return db;
  }

  // execute these queries upon initialization
  // Use CREATE TABLE IF NOT EXISTS to preserve data
  db.execSync(`
    CREATE TABLE IF NOT EXISTS check_ins(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anxiety INTEGER NOT NULL,
      stress INTEGER NOT NULL,
      depression INTEGER NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  isInitialized = true;
  return db;
}

// ===== BUSINESS LOGIC ===== 

// Save a mood check-in to the database
export async function saveCheckIn(anxiety: number, stress: number, depression: number) {
  const timestamp = new Date().toISOString();

  await db.runAsync(
    'INSERT INTO check_ins (anxiety, stress, depression, timestamp) VALUES (?, ?, ?, ?)',
    [anxiety, stress, depression, timestamp]
  );

  // Return the newly created check-in
  return db.getFirstAsync<CheckInRecord>(
    'SELECT * FROM check_ins ORDER BY id DESC LIMIT 1'
  );
}

// Save check-in through GraphQL, fallback to local database if it fails
export async function saveCheckInWithGraphQL(anxiety: number, stress: number, depression: number) {
  try {
    const { data } = await recoveryClient.mutate<{ saveCheckIn: CheckInRecord }>({
      mutation: SAVE_CHECK_IN,
      variables: { anxiety, stress, depression },
    });

    return data?.saveCheckIn ?? null;
  } catch (error) {
    console.warn('GraphQL save check-in failed, using local database', error);
    return saveCheckIn(anxiety, stress, depression); // need this because the graohQL call will fail since no server running
  }
}

// Get the last saved check-in from the database
export async function getLastCheckIn() {
  return db.getFirstAsync<CheckInRecord>(
    'SELECT * FROM check_ins ORDER BY id DESC LIMIT 1'
  );
}

// Get last check-in through GraphQL, fallback to local database if it fails
export async function getLastCheckInWithGraphQL() {
  try {
    const { data } = await recoveryClient.query<{ lastCheckIn: CheckInRecord | null }>({
      query: GET_LAST_CHECK_IN,
    });

    return data?.lastCheckIn ?? null;
  } catch (error) {
    console.warn('GraphQL get last check-in failed, using local database', error);
    return getLastCheckIn();
  }
}

// BUSINESS LOGIC: Assess risk level based on check-in scores
// Scores: 1-2 = low/good, 3-5 = high/concerning
// Enforces rules to flag when intervention might be needed
export function assessRiskLevel(anxiety: number, stress: number, depression: number) {
  const totalScore = anxiety + stress + depression;
  const highScores = [anxiety, stress, depression].filter(s => s >= 4).length;
  const averageScore = totalScore / 3;

  // High risk: total >= 12 OR 2+ scores at 4-5 OR average >= 4
  if (totalScore >= 12 || highScores >= 2 || averageScore >= 4) {
    return {
      level: 'high' as const,
      message: 'Consider reaching out to a counselor or mental health professional',
      urgency: 'immediate' as const,
      recommendation: 'Please prioritize your mental health and seek support',
    };
  }

  // Moderate risk: total >= 9 OR any single score at 4-5
  if (totalScore >= 9 || highScores >= 1) {
    return {
      level: 'moderate' as const,
      message: 'Your stress levels are elevated. Try some coping strategies',
      urgency: 'soon' as const,
      recommendation: 'Watch the recommended videos and practice self-care',
    };
  }

  // Low risk: everything else
  return {
    level: 'low' as const,
    message: 'You\'re doing well! Keep monitoring your well-being',
    urgency: 'routine' as const,
    recommendation: 'Continue your current wellness practices',
  };
}

// Get risk assessment for the most recent check-in
export async function getCurrentRiskAssessment() {
  const lastCheckIn = await getLastCheckIn();

  if (!lastCheckIn) {
    return null;
  }

  return assessRiskLevel(lastCheckIn.anxiety, lastCheckIn.stress, lastCheckIn.depression);
}