import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';

export interface ScoreEntry {
  id?: string;
  username: string;
  score: number;
  character: string;
  timestamp: any;
}

const COLLECTION_NAME = 'leaderboard';

export const saveScore = async (username: string, score: number, character: string) => {
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      username,
      score,
      character,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving score:", error);
    // Fallback? For now just log
  }
};

export const getTopScores = async (count: number = 10): Promise<ScoreEntry[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      orderBy('score', 'desc'), 
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ScoreEntry));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};
