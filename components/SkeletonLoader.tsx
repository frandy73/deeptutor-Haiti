import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'heading' | 'card' | 'avatar' | 'button' | 'image' | 'stat' | 'list' | 'chat';
  count?: number;
  className?: string;
}

const SkeletonPulse: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <div
    className={`skeleton rounded-xl ${className}`}
    style={style}
  />
);

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant = 'text', count = 1, className = '' }) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'heading':
        return (
          <div className={`space-y-3 ${className}`}>
            <SkeletonPulse className="h-8 w-3/4" />
            <SkeletonPulse className="h-5 w-1/2" />
          </div>
        );

      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <SkeletonPulse
                key={i}
                className="h-4"
                style={{ width: `${85 - (i % 3) * 15}%` }}
              />
            ))}
          </div>
        );

      case 'avatar':
        return (
          <div className={`flex items-center gap-3 ${className}`}>
            <SkeletonPulse className="w-12 h-12 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <SkeletonPulse className="h-4 w-1/3" />
              <SkeletonPulse className="h-3 w-1/4" />
            </div>
          </div>
        );

      case 'card':
        return (
          <div
            className={`rounded-2xl p-4 space-y-3 ${className}`}
            style={{ background: 'rgba(22, 29, 51, 0.85)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-3">
              <SkeletonPulse className="w-11 h-11 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <SkeletonPulse className="h-4 w-2/3" />
                <SkeletonPulse className="h-3 w-1/2" />
              </div>
            </div>
            <SkeletonPulse className="h-3 w-full" />
            <SkeletonPulse className="h-3 w-4/5" />
          </div>
        );

      case 'button':
        return (
          <SkeletonPulse className={`h-12 w-32 rounded-2xl ${className}`} />
        );

      case 'image':
        return (
          <SkeletonPulse className={`aspect-video w-full rounded-2xl ${className}`} />
        );

      case 'stat':
        return (
          <div
            className={`flex flex-col items-center justify-center rounded-2xl p-4 gap-2 ${className}`}
            style={{ background: 'rgba(22, 29, 51, 0.85)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <SkeletonPulse className="w-8 h-8 rounded-full" />
            <SkeletonPulse className="h-7 w-16" />
            <SkeletonPulse className="h-3 w-12" />
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'var(--surface-container-lowest)' }}
              >
                <SkeletonPulse className="w-9 h-9 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <SkeletonPulse className="h-4 w-3/4" />
                  <SkeletonPulse className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'chat':
        return (
          <div className={`space-y-4 ${className}`}>
            {/* Bot message skeleton */}
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-2xl rounded-tl-sm max-w-[80%] space-y-2"
                style={{ background: 'rgba(22, 29, 51, 0.85)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center gap-2">
                  <SkeletonPulse className="w-6 h-6 rounded-full shrink-0" />
                  <SkeletonPulse className="h-3 w-16" />
                </div>
                <SkeletonPulse className="h-4 w-full" />
                <SkeletonPulse className="h-4 w-4/5" />
              </div>
            </div>
            {/* User message skeleton */}
            <div className="flex justify-end">
              <div
                className="px-4 py-3 rounded-2xl rounded-tr-sm max-w-[70%] space-y-2"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #ffb1c7 100%)' }}
              >
                <SkeletonPulse className="h-4 w-full bg-white/20" />
                <SkeletonPulse className="h-4 w-3/5 bg-white/20" />
              </div>
            </div>
            {/* Another bot message skeleton */}
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-2xl rounded-tl-sm max-w-[75%] space-y-2"
                style={{ background: 'rgba(22, 29, 51, 0.85)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <SkeletonPulse className="h-4 w-full" />
                <SkeletonPulse className="h-4 w-2/3" />
                <SkeletonPulse className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        );

      default:
        return <SkeletonPulse className={`h-4 w-full ${className}`} />;
    }
  };

  if (variant === 'stat' || variant === 'card') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
        ))}
      </div>
    );
  }

  return <>{renderSkeleton()}</>;
};

export default SkeletonLoader;

// Pre-built page skeletons
export const DashboardSkeleton: React.FC = () => (
  <div className="flex flex-col h-full overflow-y-auto custom-scrollbar" style={{ background: 'var(--surface-container-lowest)' }}>
    {/* Hero Header Skeleton */}
    <div className="relative shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 60%, #a21caf 100%)' }}>
      <div className="relative z-10 p-5 sm:p-6 max-w-5xl mx-auto w-full">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="w-10 h-10 rounded-xl bg-white/20" />
            <div className="space-y-2">
              <SkeletonPulse className="h-3 w-24 bg-white/30" />
              <SkeletonPulse className="h-7 w-36 bg-white/30" />
            </div>
          </div>
          <SkeletonPulse className="w-14 h-14 rounded-2xl bg-white/20" />
        </div>
        {/* XP bar skeleton */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between">
            <SkeletonPulse className="h-3 w-20 bg-white/30" />
            <SkeletonPulse className="h-3 w-10 bg-white/30" />
          </div>
          <SkeletonPulse className="h-2.5 w-full bg-white/20 rounded-full" />
        </div>
        {/* Stat pills skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/10">
              <SkeletonPulse className="w-4 h-4 rounded-full bg-white/30" />
              <SkeletonPulse className="h-3 w-8 bg-white/30" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="p-4 sm:p-5 lg:p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Stats Grid */}
      <SkeletonLoader variant="stat" count={4} />
      
      {/* Quick Actions */}
      <div>
        <SkeletonPulse className="h-4 w-28 mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonLoader key={i} variant="card" />
          ))}
        </div>
      </div>
      
      {/* Badges */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(22, 29, 51, 0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <SkeletonPulse className="h-5 w-24" />
          <SkeletonPulse className="h-5 w-10" />
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <SkeletonPulse className="w-6 h-6 rounded-full mb-1" />
              <SkeletonPulse className="h-2 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const ChatSkeleton: React.FC = () => (
  <div className="flex flex-col h-full" style={{ background: 'var(--surface-container-lowest)' }}>
    {/* Header Skeleton */}
    <div className="shrink-0 flex items-center justify-between px-4 py-3" style={{ background: 'rgba(22, 29, 51, 0.85)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center gap-2.5">
        <SkeletonPulse className="w-9 h-9 rounded-xl" />
        <div className="space-y-1.5">
          <SkeletonPulse className="h-4 w-32" />
          <SkeletonPulse className="h-2.5 w-20" />
        </div>
      </div>
      <SkeletonPulse className="w-9 h-9 rounded-xl" />
    </div>

    {/* Messages Skeleton */}
    <div className="flex-1 p-4 sm:p-5">
      <SkeletonLoader variant="chat" />
    </div>

    {/* Input Skeleton */}
    <div className="shrink-0 px-3 pt-3 pb-4" style={{ background: 'rgba(22, 29, 51, 0.85)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <SkeletonPulse className="flex-1 h-12 rounded-2xl" />
        <div className="flex flex-col gap-1.5">
          <SkeletonPulse className="w-11 h-11 rounded-2xl" />
          <SkeletonPulse className="w-11 h-11 rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

export const FlashcardsSkeleton: React.FC = () => (
  <div className="flex flex-col h-full" style={{ background: 'var(--surface-container-lowest)' }}>
    {/* Header Skeleton */}
    <div className="shrink-0 p-4 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
      <SkeletonPulse className="w-14 h-14 rounded-2xl bg-white/20" />
      <div className="space-y-2">
        <SkeletonPulse className="h-6 w-32 bg-white/30" />
        <SkeletonPulse className="h-4 w-48 bg-white/30" />
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="flex-1 p-4 sm:p-6 space-y-6">
      {/* Generator */}
      <div className="rounded-3xl p-6" style={{ background: 'rgba(22, 29, 51, 0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <SkeletonPulse className="h-5 w-48 mb-2" />
        <SkeletonPulse className="h-3 w-64 mb-4" />
        <div className="flex gap-3">
          <SkeletonPulse className="flex-1 h-12 rounded-2xl" />
          <SkeletonPulse className="w-36 h-12 rounded-2xl" />
        </div>
      </div>

      {/* Deck Grid */}
      <div>
        <SkeletonPulse className="h-4 w-28 mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-3xl p-5" style={{ background: 'rgba(22, 29, 51, 0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex justify-between items-start mb-4">
                <SkeletonPulse className="w-12 h-12 rounded-2xl" />
                <SkeletonPulse className="w-8 h-8 rounded-full" />
              </div>
              <SkeletonPulse className="h-5 w-3/4 mb-2" />
              <SkeletonPulse className="h-3 w-1/2 mb-4" />
              <SkeletonPulse className="h-1.5 w-full mb-4" />
              <SkeletonPulse className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const KnowledgeBaseSkeleton: React.FC = () => (
  <div className="flex flex-col h-full" style={{ background: 'var(--surface-container-lowest)' }}>
    {/* Header */}
    <div className="shrink-0 p-4 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)' }}>
      <SkeletonPulse className="w-14 h-14 rounded-2xl bg-white/20" />
      <div className="space-y-2">
        <SkeletonPulse className="h-6 w-40 bg-white/30" />
        <SkeletonPulse className="h-4 w-56 bg-white/30" />
      </div>
    </div>

    {/* Upload area */}
    <div className="p-4 sm:p-6 space-y-4">
      <div className="rounded-2xl p-6 border-2 border-dashed" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(22, 29, 51, 0.85)' }}>
        <div className="flex flex-col items-center gap-3">
          <SkeletonPulse className="w-16 h-16 rounded-2xl" />
          <SkeletonPulse className="h-4 w-48" />
          <SkeletonPulse className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* File list */}
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(22, 29, 51, 0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <SkeletonPulse className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <SkeletonPulse className="h-4 w-2/3" />
              <SkeletonPulse className="h-3 w-1/3" />
            </div>
            <SkeletonPulse className="w-8 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
