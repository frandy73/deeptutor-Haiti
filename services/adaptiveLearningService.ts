import { StudentProgress } from '../types';

interface ConceptPriority {
  subject: string;
  score: number;
  reason: string;
}

const SUBJECTS = ['matematik', 'fizik', 'chimi', 'biyoloji', 'angle', 'kreyòl', 'istwa', 'jewografi'];

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

function calculateFatigue(progress: StudentProgress): number {
  if (progress.totalMessages === 0) return 0;
  const recency = Date.now() - new Date(progress.lastActiveDate).getTime();
  const hoursSinceLastActivity = recency / (1000 * 60 * 60);
  return Math.max(0, Math.min(1, 1 - hoursSinceLastActivity / 24));
}

function getRepetitionCount(subject: string, progress: StudentProgress): number {
  const key = `rep_${subject}`;
  return (progress as any)[key] || 0;
}

export function calculatePriorities(progress: StudentProgress): ConceptPriority[] {
  const scores = SUBJECTS.map(subject => {
    const strength = progress.subjectScores[subject] || 0;
    const maxScore = Math.max(...Object.values(progress.subjectScores), 1);
    const V = normalize(strength, 0, maxScore);

    const repetitionCount = getRepetitionCount(subject, progress);
    const repetitionPenalty = Math.min(1, repetitionCount / 5);

    const isMastered = progress.masteredTopics?.some(t => t.toLowerCase().includes(subject)) || false;

    const A = isMastered ? 0 : (1 - V);

    const fatigue = calculateFatigue(progress);
    const Q = A * 0.6 + (1 - repetitionPenalty) * 0.2 + (1 - fatigue) * 0.2;

    return {
      subject,
      score: Q,
      reason: A > 0.5
        ? `${subject} se matyè ki pi fèb (fòs: ${Math.round(V * 100)}%)`
        : repetitionCount > 3
          ? `ou fè ${subject} twòp fwa, eseye yon lòt matyè`
          : `${subject} nivo mwayen`
    };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores;
}

export function getNextRecommendedSubject(progress: StudentProgress): ConceptPriority | null {
  const priorities = calculatePriorities(progress);
  if (priorities.length === 0) return null;

  const roll = Math.random();
  if (roll < 0.7) {
    return priorities[0];
  }
  if (roll < 0.9) {
    return priorities[Math.floor(Math.random() * Math.min(3, priorities.length))];
  }
  return priorities[Math.floor(Math.random() * priorities.length)];
}

export function recordRepetition(subject: string, progress: StudentProgress): StudentProgress {
  const key = `rep_${subject}`;
  const current = getRepetitionCount(subject, progress);
  return { ...progress, [key]: current + 1 };
}

export function resetRepetition(subject: string, progress: StudentProgress): StudentProgress {
  const key = `rep_${subject}`;
  return { ...progress, [key]: 0 };
}
