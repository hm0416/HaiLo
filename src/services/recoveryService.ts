import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('releaseu.db'); // creates DB

export function initDatabase() {
    // execute these queeries upon initalization
    db.execSync(`
    CREATE TABLE IF NOT EXISTS check_ins (
      id TEXT PRIMARY KEY NOT NULL,
      createdAt TEXT NOT NULL,
      moodScore INTEGER NOT NULL,
      concernLevel TEXT NOT NULL,
      recommendation TEXT NOT NULL
    );
  `);

    db.execSync(`
    CREATE TABLE IF NOT EXISTS sobriety_entries (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL
    );
  `);

    db.execSync(`
    CREATE TABLE IF NOT EXISTS videos_watched (
      id TEXT PRIMARY KEY NOT NULL,
      videoId TEXT NOT NULL,
      watchedAt TEXT NOT NULL
    );
  `);

    db.execSync(`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id TEXT PRIMARY KEY NOT NULL,
      author TEXT NOT NULL,
      text TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);
}

// transforms multiple inputs into a mood category such as low, moderate, high concern.
function calculateMoodScore(checkinResponses: any) {
    throw new Error("Function not implemented.")
}

// maps the result to a recommended video or fallback tip set.
function selectRecommendation(moodScore: any) {
    throw new Error("Function not implemented.")
}

// computes current // sobriety streak based on day-by-day entries.
function calculateStreak(history: History) {
    throw new Error("Function not implemented.")
}
// determines when to unlock reward states.
function evaluateMilestone(streak: any, completedDays: any) {
    throw new Error("Function not implemented.")
}

// aggregates the student’s recent progress.
function summarizeDashboard(checkins: any, streaks: any, videosWatched: any) {
    throw new Error("Function not implemented.")
}
