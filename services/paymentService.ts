export interface PremiumRequest {
  id: string;
  lastName: string;
  firstName: string;
  phone: string;
  tier: string;
  amount: string;
  photoName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const STORAGE_KEY = 'premium_requests';

export const savePremiumRequest = (request: Omit<PremiumRequest, 'id' | 'createdAt' | 'status'>): void => {
  const requests = getPremiumRequests();
  const newRequest: PremiumRequest = {
    ...request,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
    status: 'pending'
  };
  
  requests.unshift(newRequest);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
};

export const getPremiumRequests = (): PremiumRequest[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const updateRequestStatus = (id: string, status: 'approved' | 'rejected'): void => {
  const requests = getPremiumRequests();
  const updated = requests.map(r => r.id === id ? { ...r, status } : r);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteRequest = (id: string): void => {
  const requests = getPremiumRequests();
  const filtered = requests.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};