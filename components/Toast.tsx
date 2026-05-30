import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'achievement' | 'warning';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  icon?: string;
  duration?: number;
}

interface ToastItemProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const ICONS: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  achievement: '🏆',
  warning: '⚠️',
};

const COLORS: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
  error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
  info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
  achievement: { bg: '#f5f3ff', border: '#8b5cf6', text: '#5b21b6' },
  warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
};

const DARK_COLORS: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: { bg: '#064e3b', border: '#34d399', text: '#d1fae5' },
  error: { bg: '#450a0a', border: '#f87171', text: '#fecaca' },
  info: { bg: '#0c1929', border: '#60a5fa', text: '#bfdbfe' },
  achievement: { bg: '#1d1245', border: '#a78bfa', text: '#ddd6fe' },
  warning: { bg: '#451a03', border: '#fbbf24', text: '#fde68a' },
};

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const colors = isDark ? DARK_COLORS[toast.type] : COLORS[toast.type];
  const icon = toast.icon || ICONS[toast.type];

  useEffect(() => {
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`pointer-events-auto transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      style={{
        maxWidth: '380px',
        width: '100%',
      }}
    >
      <div
        className="relative flex items-start gap-3 p-4 rounded-2xl shadow-xl border-l-4"
        style={{
          background: colors.bg,
          borderLeftColor: colors.border,
          color: colors.text,
        }}
      >
        <span className="text-xl shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm leading-tight mb-0.5">{toast.title}</p>
          <p className="text-[12px] font-medium opacity-80 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold opacity-40 hover:opacity-100 transition-all hover:bg-black/10"
        >
          ✕
        </button>
        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-1 rounded-full animate-shrink"
          style={{
            background: colors.border,
            animation: `shrink ${(toast.duration || 4000)}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      style={{ maxHeight: 'calc(100vh - 32px)', overflow: 'hidden' }}
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default ToastContainer;
