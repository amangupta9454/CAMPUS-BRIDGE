import React, { useState, useEffect } from 'react';

const CLOSED_STATUSES = ['Resolved', 'Rejected', 'Withdrawn'];

/**
 * SlaTimer — Real-time countdown to SLA deadline.
 * 
 * Props:
 *   deadline  — ISO date string or Date for the SLA deadline
 *   status    — current complaint status (hides timer for closed statuses)
 *   compact   — if true, renders a small inline badge (for table rows)
 */
const SlaTimer = ({ deadline, status, compact = false }) => {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!deadline || CLOSED_STATUSES.includes(status)) return;

    const tick = () => {
      const now = Date.now();
      const dl = new Date(deadline).getTime();
      setRemaining(dl - now);
    };

    tick(); // immediate
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline, status]);

  if (!deadline || CLOSED_STATUSES.includes(status) || remaining === null) return null;

  const isOverdue = remaining < 0;
  const absMs = Math.abs(remaining);

  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absMs % (1000 * 60)) / 1000);

  // Format time string
  let timeStr = '';
  if (days > 0) timeStr += `${days}d `;
  if (hours > 0 || days > 0) timeStr += `${hours}h `;
  timeStr += `${minutes}m`;
  if (!compact) timeStr += ` ${seconds}s`;

  // Determine urgency level
  const hoursRemaining = remaining / (1000 * 60 * 60);
  let urgency = 'safe';       // > 6hrs remaining
  if (isOverdue) urgency = 'overdue';
  else if (hoursRemaining < 2) urgency = 'critical';
  else if (hoursRemaining < 6) urgency = 'warning';

  const styles = {
    safe: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: '⏳',
      glow: '',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: '⚠️',
      glow: '',
    },
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: '🔴',
      glow: 'animate-pulse',
    },
    overdue: {
      bg: 'bg-red-100',
      border: 'border-red-300',
      text: 'text-red-800',
      icon: '🚨',
      glow: 'animate-pulse',
    },
  };

  const s = styles[urgency];

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${s.bg} ${s.border} ${s.text} ${s.glow}`}>
        <span>{s.icon}</span>
        {isOverdue ? (
          <span>OVERDUE {timeStr}</span>
        ) : (
          <span>{timeStr} left</span>
        )}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${s.bg} ${s.border} ${s.glow} transition-all`}>
      <span className="text-lg">{s.icon}</span>
      <div className="flex flex-col">
        <span className={`text-xs font-black uppercase tracking-wider ${s.text}`}>
          {isOverdue ? 'SLA OVERDUE' : 'SLA Countdown'}
        </span>
        <span className={`text-sm font-bold tabular-nums ${s.text}`}>
          {isOverdue ? `Overdue by ${timeStr}` : `${timeStr} remaining`}
        </span>
      </div>
      {/* Progress ring for non-compact */}
      {!isOverdue && (
        <div className="ml-auto">
          <div className={`w-8 h-8 rounded-full border-[3px] ${
            urgency === 'safe' ? 'border-emerald-300' :
            urgency === 'warning' ? 'border-amber-300' :
            'border-red-400'
          } flex items-center justify-center`}>
            <span className={`text-[9px] font-black ${s.text}`}>
              {days > 0 ? `${days}d` : `${hours}h`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlaTimer;
