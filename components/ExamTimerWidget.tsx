import React, { useState, useEffect, useCallback } from 'react';

interface ExamTimerWidgetProps {
    onTimeUp: () => void;
}

const ExamTimerWidget: React.FC<ExamTimerWidgetProps> = ({ onTimeUp }) => {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [showConfig, setShowConfig] = useState(true);

    const startTimer = (minutes: number) => {
        setTimeLeft(minutes * 60);
        setIsActive(true);
        setShowConfig(false);
    };

    const stopTimer = useCallback(() => {
        setIsActive(false);
        setTimeLeft(0);
        setShowConfig(true);
    }, []);

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            onTimeUp();
            alert('Tan an fini! ⏰');
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isActive, timeLeft, onTimeUp]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (showConfig) {
        return (
            <div className="p-3 rounded-xl shadow-sm border mt-2 flex items-center gap-3 glass-card"
                >
                <span className="text-xl">⏱️</span>
                <div className="flex gap-2">
                    {[5, 15, 30].map(m => (
                        <button key={m} onClick={() => startTimer(m)}
                            className="px-3 py-1 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                            style={{ background: 'rgba(79,70,229,0.15)', color: 'var(--primary)' }}>
                            {m} min
                        </button>
                    ))}
                </div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Pratike sou presyon tan!</p>
            </div>
        );
    }

    return (
        <div className="p-3 rounded-xl shadow-md border mt-2 flex items-center justify-between"
            style={{ background: isActive && timeLeft < 60 ? '#fef2f2' : 'rgba(22, 29, 51, 0.85)', borderColor: isActive && timeLeft < 60 ? '#fee2e2' : 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3">
                <span className={`text-xl ${isActive && timeLeft < 60 ? 'animate-pulse' : ''}`}>
                    {timeLeft < 60 ? '⚠️' : '⏲️'}
                </span>
                <span className="text-lg font-mono font-bold" style={{ color: timeLeft < 60 ? '#ef4444' : 'var(--text-main)' }}>
                    {formatTime(timeLeft)}
                </span>
            </div>
            <button onClick={stopTimer} className="p-1 px-3 text-xs font-bold text-gray-500 hover:text-red-500 transition-all">
                STOP
            </button>
        </div>
    );
};

export default ExamTimerWidget;
