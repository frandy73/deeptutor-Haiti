import { loadProgress, saveProgress } from './localStorageService';
import { updateUserProgress, getUserProfile } from './firebaseService';

let currentUid: string | null = null;

export const setSyncUid = (uid: string | null) => {
  currentUid = uid;
};

export const pushProgressToFirebase = async (): Promise<void> => {
  if (!currentUid) return;
  const progress = loadProgress();
  try {
    await updateUserProgress(currentUid, {
      xp: progress.xp,
      streak: progress.streak,
      totalMessages: progress.totalMessages,
      totalQuizzes: progress.totalQuizzes,
      badges: progress.badges,
      masteredTopics: progress.masteredTopics || [],
    });
  } catch {
    // Offline - will sync next time
  }
};

export const pullProgressFromFirebase = async (): Promise<void> => {
  if (!currentUid) return;
  try {
    const profile = await getUserProfile(currentUid);
    if (!profile) return;

    const local = loadProgress();
    const merged = { ...local };

    if (profile.xp !== undefined) merged.xp = Math.max(local.xp, profile.xp);
    if (profile.streak !== undefined) merged.streak = Math.max(local.streak, profile.streak);
    if (profile.totalMessages !== undefined) merged.totalMessages = Math.max(local.totalMessages, profile.totalMessages);
    if (profile.totalQuizzes !== undefined) merged.totalQuizzes = Math.max(local.totalQuizzes, profile.totalQuizzes);
    if (profile.badges !== undefined) merged.badges = [...new Set([...local.badges, ...profile.badges])];
    if (profile.masteredTopics !== undefined) {
      merged.masteredTopics = [...new Set([...(local.masteredTopics || []), ...profile.masteredTopics])];
    }

    saveProgress(merged);
  } catch {
    // Offline - will sync next time
  }
};
