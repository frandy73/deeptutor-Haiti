import React from 'react';

const ModuleSkeleton: React.FC<{ title?: string }> = ({ title }) => (
  <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--surface-container-lowest)' }}>
    <div className="h-16 skeleton" />
    <div className="flex-1 p-6 space-y-4">
      <div className="h-8 w-2/3 skeleton rounded-xl" />
      <div className="h-4 w-1/3 skeleton rounded-xl" />
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="h-32 skeleton rounded-2xl" />
        <div className="h-32 skeleton rounded-2xl" />
        <div className="h-32 skeleton rounded-2xl" />
        <div className="h-32 skeleton rounded-2xl" />
      </div>
      <div className="h-48 skeleton rounded-2xl" />
    </div>
  </div>
);

export default ModuleSkeleton;
