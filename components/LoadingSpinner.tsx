import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-start gap-2">
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-full" style={{ background: 'rgba(79,70,229,0.15)' }}>
        <div className="typing-dot-lg"></div>
        <div className="typing-dot-lg"></div>
        <div className="typing-dot-lg"></div>
      </div>
      {message && <span className="ml-1 text-sm font-bold animate-pulse" style={{ color: 'var(--primary)' }}>{message}</span>}
    </div>
  );
};

export default LoadingSpinner;