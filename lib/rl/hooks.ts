import { useState, useEffect, useCallback, useRef } from 'react';
import { MazeEnvironment } from './maze-environment';
import { DPAgent } from './dp-agent';

export interface UseMazeRLResult {
  env: MazeEnvironment;
  agent: DPAgent;
  isRunning: boolean;
  selectedCell: number | null;
  iterations: number;
  
  evaluatePolicy: () => void;
  updatePolicy: () => void;
  togglePolicyIteration: () => void;
  reset: () => void;
  setSelectedCell: (cell: number | null) => void;
  setReward: (cell: number, reward: number) => void;
}

export function useMazeRL(
  width: number = 20,
  height: number = 10,
  gamma: number = 0.9
): UseMazeRLResult {
  const [env] = useState(() => new MazeEnvironment(width, height));
  const [agent] = useState(() => new DPAgent(env, gamma));
  
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [iterations, setIterations] = useState(0);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const evaluatePolicy = useCallback(() => {
    agent.evaluatePolicy();
    setIterations(prev => prev + 1);
    forceUpdate();
  }, [agent, forceUpdate]);

  const updatePolicy = useCallback(() => {
    agent.updatePolicy();
    forceUpdate();
  }, [agent, forceUpdate]);

  const toggleValueIteration = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const reset = useCallback(() => {
    agent.reset();
    setIterations(0);
    setIsRunning(false);
    forceUpdate();
  }, [agent, forceUpdate]);

  const setReward = useCallback((cell: number, reward: number) => {
    env.setReward(cell, reward);
    forceUpdate();
  }, [env, forceUpdate]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        agent.policyIteration();
        setIterations(prev => prev + 1);
        forceUpdate();
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, agent, forceUpdate]);

  return {
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
  };
}

export function useAnimationState() {
  const [animatingCells, setAnimatingCells] = useState<Set<number>>(new Set());

  const animateCell = useCallback((cell: number) => {
    setAnimatingCells(prev => new Set(prev).add(cell));
    setTimeout(() => {
      setAnimatingCells(prev => {
        const next = new Set(prev);
        next.delete(cell);
        return next;
      });
    }, 300);
  }, []);

  return { animatingCells, animateCell };
}

