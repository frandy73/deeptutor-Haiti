import { ToastData, ToastType } from '../components/Toast';

type Listener = (toast: ToastData) => void;

let listeners: Listener[] = [];

export const notify = (type: ToastType, title: string, message: string, icon?: string, duration?: number) => {
  const toast: ToastData = {
    id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 5),
    type,
    title,
    message,
    icon,
    duration,
  };
  listeners.forEach(fn => fn(toast));
  return toast.id;
};

export const notifySuccess = (title: string, message: string) =>
  notify('success', title, message);

export const notifyError = (title: string, message: string) =>
  notify('error', title, message);

export const notifyInfo = (title: string, message: string) =>
  notify('info', title, message);

export const notifyAchievement = (title: string, message: string) =>
  notify('achievement', title, message, '🏆', 6000);

export const notifyWarning = (title: string, message: string) =>
  notify('warning', title, message);

export const onNotification = (fn: Listener) => {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
};
