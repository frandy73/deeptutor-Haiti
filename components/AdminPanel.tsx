import React, { useState, useEffect } from 'react';
import { getPremiumRequests, updateRequestStatus, deleteRequest, PremiumRequest } from '../services/paymentService';

interface AdminPanelProps {
  onMenuClick?: () => void;
  onClose?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onMenuClick, onClose }) => {
  const [requests, setRequests] = useState<PremiumRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    setRequests(getPremiumRequests());
  };

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    updateRequestStatus(id, status);
    loadRequests();
  };

  const handleDelete = (id: string) => {
    if (confirm('Ou sure ou vle efase demand sa?')) {
      deleteRequest(id);
      loadRequests();
    }
  };

  const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="flex-grow flex flex-col h-screen overflow-hidden" style={{ background: 'var(--surface-container-lowest)' }}>
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b shrink-0 glass-card" style={{ borderRadius: 0 }}>
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 rounded-xl hover:bg-black/5 transition-all">
              <span className="text-xl">☰</span>
            </button>
          )}
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <span className="text-2xl">⚙️</span> Admin Panel
          </h1>
        </div>
        <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium hover:opacity-80">
          Fèmen
        </button>
      </header>

      <div className="flex-grow overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-black/5 dark:border-white/5">
              <p className="text-2xl font-black" style={{ color: 'var(--text-main)' }}>{requests.length}</p>
              <p className="text-xs font-medium opacity-60">Total</p>
            </div>
            <div className="p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-2xl font-black text-yellow-600">{pendingCount}</p>
              <p className="text-xs font-medium text-yellow-600">An atann</p>
            </div>
            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-2xl font-black text-green-600">{approvedCount}</p>
              <p className="text-xs font-medium text-green-600">Aprov</p>
            </div>
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-2xl font-black text-red-600">{rejectedCount}</p>
              <p className="text-xs font-medium text-red-600">Rejte</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  filter === f 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f === 'all' ? 'Tout' : f === 'pending' ? 'An atann' : f === 'approved' ? 'Aprov' : 'Rejte'}
              </button>
            ))}
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 opacity-60">
                <p className="text-4xl mb-4">📭</p>
                <p className="font-medium">Pa gen demann</p>
              </div>
            ) : (
              filteredRequests.map(request => (
                <div
                  key={request.id}
                  className="p-4 md:p-6 rounded-2xl bg-white dark:bg-slate-800 border border-black/5 dark:border-white/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          request.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {request.status}
                        </span>
                        <span className="text-sm opacity-60">
                          {new Date(request.createdAt).toLocaleDateString('HT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>
                        {request.lastName} {request.firstName}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="opacity-60">Plan</p>
                          <p className="font-bold">{request.tier}</p>
                        </div>
                        <div>
                          <p className="opacity-60">Kantite</p>
                          <p className="font-bold">{request.amount}</p>
                        </div>
                        <div>
                          <p className="opacity-60">Telefòn</p>
                          <p className="font-bold">+509{request.phone}</p>
                        </div>
                        <div>
                          <p className="opacity-60">Foto</p>
                          <p className="font-bold">{request.photoName}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <button
                        onClick={() => handleUpdateStatus(request.id, 'approved')}
                        className="flex-1 py-2 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all"
                      >
                        ✅ Aprov
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(request.id, 'rejected')}
                        className="flex-1 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
                      >
                        ❌ Rejte
                      </button>
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;