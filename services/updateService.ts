import { notifyInfo } from './notificationService';

const STORAGE_KEY = 'pwofou_whatsnew';

export interface UpdateItem {
  id: string;
  date: string;
  icon: string;
  title: string;
  description: string;
}

const UPDATES: UpdateItem[] = [
  {
    id: 'streaming',
    date: '2026-06-22',
    icon: '⚡',
    title: 'Chat Streaming',
    description: 'Repons AI yo parèt mo pa mo kounye a — eksperyans pi rapid ak pi natirèl!',
  },
  {
    id: 'premium',
    date: '2026-06-22',
    icon: '💎',
    title: 'Abònman Premium',
    description: 'Debloke tout fonksyonalite ak plan Premium ou! Peye ak MonCash.',
  },
  {
    id: 'glossary',
    date: '2026-06-22',
    icon: '📖',
    title: 'Diksyonè Popòv',
    description: 'Klike sou yon mo nan repons AI a pou w wè definisyon li.',
  },
  {
    id: 'logout',
    date: '2026-06-22',
    icon: '🚪',
    title: 'Dekonekte',
    description: 'Bouton dekonekte nan sidebar la pou w chanje kont ou.',
  },
];

export function getUnseenUpdates(): UpdateItem[] {
  try {
    const seen = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
    return UPDATES.filter(u => !seen.includes(u.id));
  } catch {
    return UPDATES;
  }
}

export function markAllSeen(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(UPDATES.map(u => u.id)));
}

export function showUnseenNotifications(): void {
  const unseen = getUnseenUpdates();
  unseen.forEach(u => {
    notifyInfo(u.icon + ' ' + u.title, u.description);
  });
  markAllSeen();
}
