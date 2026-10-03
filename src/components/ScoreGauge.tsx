import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 140,
  strokeWidth = 12,
  label = 'Overall Score'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let colorClass = 'text-blue-600';
  let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
  let badgeText = 'Good Match';

  if (score >= 80) {
    colorClass = 'text-emerald-500';
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    badgeText = 'Excellent Match';
  } else if (score >= 65) {
    colorClass = 'text-blue-600';
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    badgeText = 'Strong Match';
  } else if (score >= 50) {
    colorClass = 'text-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    badgeText = 'Needs Work';
  } else {
    colorClass = 'text-rose-500';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    badgeText = 'Low Match';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100"
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
            fill="transparent"
          />
        </svg>

        {/* Center Score */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
            {score}
          </span>
          <span className="text-[11px] font-bold text-slate-400 mt-0.5">/100</span>
        </div>
      </div>

      <div className="mt-2.5 text-center">
        <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
          {badgeText}
        </span>
      </div>
    </div>
  );
};
