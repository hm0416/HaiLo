import * as SQLite from 'expo-sqlite';
import { GET_VIDEOS, recoveryClient } from '../client/recoveryClient';
import type { VideoRecord } from '@/api/types';

// export class RecoveryService {

// }

const db = SQLite.openDatabaseSync('releaseu.db'); // creates DB

export async function initDatabase() {
  // execute these queeries upon initalization

  // drop table removes the old table definitions - was having trouble when updating the links below
  // create table builds the new schema 
  db.execSync(`
    DROP TABLE IF EXISTS videos;
    CREATE TABLE videos(
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      source TEXT NOT NULL,
      topic TEXT NOT NULL,
      minScore INTEGER NOT NULL
    );
  `);

  await seedVideos(db); // reinstered with latest video values
  return db;
}

async function seedVideos(db: SQLite.SQLiteDatabase) {
  const anxietyVideo = 'https://www.youtube.com/watch?v=FpiWSFcL3-c';
  const stressVideo = 'https://www.youtube.com/watch?v=RcGyVTAoXEU&t=459s';
  const depressionVideo = 'https://www.youtube.com/watch?v=HWcphoKlbxY';

  const seedRows: Array<[string, string, string, string, number]> = [
    ['v1', 'How to Calm Your Anxiety, From a Neuroscientist | The Way We Work, a TED series', anxietyVideo, 'anxiety', 3],
    ['v2', 'How to Make Stress Your Friend | Kelly McGonigal | TED', stressVideo, 'stress', 3],
    ['v3', 'Understanding & Conquering Depression | Huberman Lab Essentials', depressionVideo, 'depression', 3],
  ]; // TODO: figure out which to suggest if all meet min score

  for (const [id, title, source, topic, minScore] of seedRows) {
    await db.runAsync(
      'INSERT OR REPLACE INTO videos (id, title, source, topic, minScore) VALUES (?, ?, ?, ?, ?)',
      [id, title, source, topic, minScore]
    );
  }
}


// business logic 

export async function getVideos() {
  const videos = await db.getAllAsync<VideoRecord>(
    'SELECT * FROM videos ORDER BY topic, title'
  );
  return videos;
}

// fetch videos from GraphQL API, fallback to local database if it fails
export async function getVideosFromGraphQL() {
  try {
    const { data } = await recoveryClient.query<{ videos: VideoRecord[] }>({
      query: GET_VIDEOS,
    });

    return data?.videos ?? [];
  } catch (error) {
    console.warn('GraphQL videos failed, using local data', error);
    return getVideos();
  }
}

// for exercise, only one video per topic 
export async function getVideoByTopic(topic: string) {
  return db.getFirstAsync<VideoRecord>(
    'SELECT * FROM videos WHERE topic = ? LIMIT 1',
    [topic]
  );
}

// for real use, there will be more than one video per topic so will fetch videos by topic and potentially select one based on additional criteria such as user preferences or minScore

// export async function getVideosByTopic(topic: string) {
//   return db.getAllAsync<VideoRecord>(
//     'SELECT * FROM videos WHERE topic = ? ORDER BY minScore DESC, id DESC',
//     [topic]
//   );
// }