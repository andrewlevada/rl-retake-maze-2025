'use client';

import React, { useState, useEffect } from 'react';
import { MazeGrid } from '@/components/MazeGrid';
import { ControlPanel } from '@/components/ControlPanel';
import { useMazeRL } from '@/lib/rl/hooks';

export default function Home() {
  const {
    env,
    agent,
    isRunning,
    selectedCell,
    iterations,
    evaluatePolicy,
    updatePolicy,
    togglePolicyIteration: toggleValueIteration,
    reset,
    setSelectedCell,
    setReward,
  } = useMazeRL(20, 10, 0.9);

  const [cellReward, setCellReward] = useState(0);

  useEffect(() => {
    if (selectedCell !== null) {
      setCellReward(env.getReward(selectedCell));
    }
  }, [selectedCell, env]);

  const handleRewardChange = (reward: number) => {
    setCellReward(reward);
    if (selectedCell !== null) {
      setReward(selectedCell, reward);
    }
  };

  return (
    <main className="min-h-screen px-3 py-6 sm:px-4 sm:py-8 md:px-6 md:py-10 lg:px-8 lg:py-12 bg-background mt-16 sm:mt-20">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 max-w-[1400px] mx-auto [animation:slide-in_0.6s_cubic-bezier(0.4,0,0.2,1)_both] [animation-delay:0.1s]">
        <div className="flex-1 flex justify-center items-start">
          <MazeGrid
            env={env}
            agent={agent}
            selectedCell={selectedCell}
            onCellClick={setSelectedCell}
          />
        </div>

        <ControlPanel
          isRunning={isRunning}
          iterations={iterations}
          selectedCell={selectedCell}
          cellReward={cellReward}
          onEvaluatePolicy={evaluatePolicy}
          onUpdatePolicy={updatePolicy}
          onTogglePolicyIteration={toggleValueIteration}
          onReset={reset}
          onRewardChange={handleRewardChange}
        />
      </div>
    </main>
  );
}
