'use client';

import React from 'react';

interface ControlPanelProps {
  isRunning: boolean;
  iterations: number;
  selectedCell: number | null;
  cellReward: number;
  onEvaluatePolicy: () => void;
  onUpdatePolicy: () => void;
  onTogglePolicyIteration: () => void;
  onReset: () => void;
  onRewardChange: (reward: number) => void;
}

export function ControlPanel({
  isRunning,
  iterations,
  selectedCell,
  cellReward,
  onEvaluatePolicy,
  onUpdatePolicy,
  onTogglePolicyIteration,
  onReset,
  onRewardChange,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8 bg-white rounded-xl w-full max-w-[400px] border border-slate-200">
      <div className="flex flex-col mb-1">
        <h2 className="m-0 text-xl sm:text-2xl lg:text-[28px] font-bold text-foreground tracking-[-0.5px]">Policy Iteration Demo</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">for reinforcement learning retake</p>
      </div>

      <div className="flex flex-col gap-2 sm:gap-3">
        <button
          className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-[15px] font-semibold transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] text-center disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px hover:shadow-lg active:translate-y-0 bg-blue-500 hover:bg-blue-600 text-white touch-manipulation"
          onClick={onEvaluatePolicy}
          disabled={isRunning}
        >
          Policy Evaluation
        </button>
        <button
          className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-[15px] font-semibold transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] text-center disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px hover:shadow-lg active:translate-y-0 bg-blue-500 hover:bg-blue-600 text-white touch-manipulation"
          onClick={onUpdatePolicy}
          disabled={isRunning}
        >
          Policy Update
        </button>
        <button
          className={
            (isRunning
              ? "bg-red-500 hover:bg-red-600"
              : "bg-emerald-500 hover:bg-emerald-600") +
            " px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-[15px] font-semibold transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] text-center disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px hover:shadow-lg active:translate-y-0 text-white touch-manipulation"
          }
          onClick={onTogglePolicyIteration}
        >
          {isRunning ? 'Stop' : 'Run'}
        </button>
        <button
          className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-[15px] font-semibold transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] text-center disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px hover:shadow-lg active:translate-y-0 bg-slate-100 hover:bg-slate-200 text-slate-700 touch-manipulation"
          onClick={onReset}
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-xs sm:text-sm font-medium text-slate-500">Iterations:</span>
          <span className="text-lg sm:text-xl font-bold text-foreground">{iterations}</span>
        </div>
      </div>

      {selectedCell !== null && (
        <div className="flex flex-col gap-2 sm:gap-3">
          <label className="text-xs sm:text-sm font-medium text-foreground flex justify-between items-center">
            Cell Reward: <strong>{cellReward.toFixed(2)}</strong>
          </label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={cellReward}
            onChange={(e) => onRewardChange(parseFloat(e.target.value))}
            className="w-full h-2 sm:h-2.5 rounded bg-slate-200 outline-none accent-blue-500 touch-manipulation"
          />
        </div>
      )}
    </div>
  );
}

