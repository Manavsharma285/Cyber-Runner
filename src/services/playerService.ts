import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

export interface PlayerData {
  uid: string;
  username: string;
  email: string;
  highScore: number;
  selectedCharacter: string;
  createdAt: any;
  lastPlayed: any;
}

const COLLECTION_NAME = 'players';

export const playerService = {
  async createPlayer(uid: string, username: string, email: string) {
    const playerRef = doc(db, COLLECTION_NAME, uid);
    const playerData: PlayerData = {
      uid,
      username,
      email,
      highScore: 0,
      selectedCharacter: 'ninja',
      createdAt: serverTimestamp(),
      lastPlayed: serverTimestamp()
    };
    await setDoc(playerRef, playerData);
    return playerData;
  },

  async getPlayer(uid: string): Promise<PlayerData | null> {
    const playerRef = doc(db, COLLECTION_NAME, uid);
    const playerSnap = await getDoc(playerRef);
    if (playerSnap.exists()) {
      return playerSnap.data() as PlayerData;
    }
    return null;
  },

  async updateHighScore(uid: string, newScore: number) {
    const playerRef = doc(db, COLLECTION_NAME, uid);
    const playerSnap = await getDoc(playerRef);
    
    if (playerSnap.exists()) {
      const currentData = playerSnap.data() as PlayerData;
      if (newScore > currentData.highScore) {
        await updateDoc(playerRef, {
          highScore: newScore,
          lastPlayed: serverTimestamp()
        });
        return true;
      } else {
        await updateDoc(playerRef, {
          lastPlayed: serverTimestamp()
        });
      }
    }
    return false;
  },

  async updateSelectedCharacter(uid: string, characterId: string) {
    const playerRef = doc(db, COLLECTION_NAME, uid);
    await updateDoc(playerRef, {
      selectedCharacter: characterId,
      lastPlayed: serverTimestamp()
    });
  },

  async getLeaderboard(count: number = 10): Promise<PlayerData[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('highScore', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as PlayerData);
  },

  async ensurePlayerData(uid: string, email: string, displayName?: string | null): Promise<PlayerData> {
    const playerRef = doc(db, COLLECTION_NAME, uid);
    const playerSnap = await getDoc(playerRef);
    
    if (playerSnap.exists()) {
      return playerSnap.data() as PlayerData;
    }

    // Auto-create missing record
    const username = displayName || email.split('@')[0] || 'Unknown Agent';
    console.log(`Auto-creating missing player record for: ${username}`);
    
    const playerData: PlayerData = {
      uid,
      username,
      email,
      highScore: 0,
      selectedCharacter: 'ninja',
      createdAt: serverTimestamp(),
      lastPlayed: serverTimestamp()
    };
    
    await setDoc(playerRef, playerData);
    return playerData;
  }
};
