'use client';

import React, { useState, useEffect } from 'react';
import { MazeEnvironment, CellType, Action } from '@/lib/rl/maze-environment';
import { DPAgent } from '@/lib/rl/dp-agent';

interface MazeGridProps {
  env: MazeEnvironment;
  agent: DPAgent;
  selectedCell: number | null;
  onCellClick: (cell: number) => void;
}

const COLORS = {
  background: '#f9fafb',
  wall: '#334155',
  empty: '#FFFFFF',
  start: '#60a5fa',
  goal: '#34d399',
  selectedBorder: '#ef4444',
};

export function MazeGrid({ env, agent, selectedCell, onCellClick }: MazeGridProps) {
  const [cellSize, setCellSize] = useState(40);
  
  // Responsive cell size based on screen width
  const updateCellSize = () => {
    if (typeof window === 'undefined') return;
    
    const screenWidth = window.innerWidth;
    let newCellSize = 40; // default
    
    if (screenWidth < 640) newCellSize = 28; // sm: mobile
    else if (screenWidth < 768) newCellSize = 32; // md: tablet
    else if (screenWidth < 1024) newCellSize = 36; // lg: desktop
    
    setCellSize(newCellSize);
  };
  
  useEffect(() => {
    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, []);
  
  const padding = Math.max(2, cellSize * 0.1);
  const width = env.width * cellSize;
  const height = env.height * cellSize;

  const minV = Math.min(...Array.from(agent.V));
  const maxV = Math.max(...Array.from(agent.V));
  const valueRange = maxV - minV;

  const getValueColor = (value: number): string => {
    if (valueRange < 0.001) return "grey";
    
    const normalized = (value - minV) / valueRange;
    
    if (normalized > 0.5) {
      const intensity = Math.floor((normalized - 0.5) * 2 * 180 + 75);
      return `rgb(${255 - intensity}, 255, ${255 - intensity})`;
    } else {
      const intensity = Math.floor((0.5 - normalized) * 2 * 180 + 75);
      return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
    }
  };

  const getActionEmoji = (action: Action): string => {
    switch (action) {
      case Action.Up:
        return '⬆️';
      case Action.Right:
        return '➡️';
      case Action.Down:
        return '⬇️';
      case Action.Left:
        return '⬅️';
      case Action.Stay:
        return '⏹️';
    }
  };

  const renderCell = (x: number, y: number) => {
    const state = env.posToState(x, y);
    const cellType = env.grid[y][x];
    const cx = x * cellSize + cellSize / 2;
    const cy = y * cellSize + cellSize / 2;
    
    let fillColor = COLORS.empty;
    let showArrow = false;
    let action: Action | null = null;

    if (cellType === CellType.Wall) {
      fillColor = COLORS.wall;
    } else if (cellType === CellType.Start) {
      fillColor = COLORS.start;
    } else if (cellType === CellType.Goal) {
      fillColor = COLORS.goal;
    } else {
      fillColor = getValueColor(agent.V[state]);
      
      action = agent.getAction(state);
      showArrow = action !== null;
    }

    const isSelected = selectedCell === state;
    const reward = env.getReward(state);
    const showReward = Math.abs(reward) > 0.02;

    return (
      <g key={state}>
        <rect
          x={x * cellSize + padding / 2}
          y={y * cellSize + padding / 2}
          width={cellSize - padding}
          height={cellSize - padding}
          fill={fillColor}
          stroke={isSelected ? COLORS.selectedBorder : 'none'}
          strokeWidth={isSelected ? 3 : 0}
          rx={4}
          style={{
            cursor: cellType !== CellType.Wall ? 'pointer' : 'default',
            transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            touchAction: 'manipulation',
          }}
          onClick={() => cellType !== CellType.Wall && onCellClick(state)}
          onTouchStart={(e) => {
            e.preventDefault();
            if (cellType !== CellType.Wall) {
              onCellClick(state);
            }
          }}
        />

        {showArrow && action !== null && (
          <text
            x={cx}
            y={cy + cellSize * 0.15}
            textAnchor="middle"
            fontSize={Math.max(12, cellSize * 0.5)}
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
            }}
          >
            {getActionEmoji(action)}
          </text>
        )}

        {showReward && cellType !== CellType.Wall && (
          <text
            x={cx}
            y={cy + cellSize / 3}
            textAnchor="middle"
            fontSize={Math.max(8, cellSize * 0.25)}
            fontWeight="600"
            fill="white"
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {reward > 0 ? '+' : ''}{reward.toFixed(1)}
          </text>
        )}

        {cellType === CellType.Start && (
          <text
            x={cx}
            y={cy + cellSize * 0.15}
            textAnchor="middle"
            fontSize={Math.max(16, cellSize * 0.6)}
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            🏠
          </text>
        )}

        {cellType === CellType.Goal && (
          <text
            x={cx}
            y={cy + cellSize * 0.15}
            textAnchor="middle"
            fontSize={Math.max(16, cellSize * 0.6)}
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            🎯
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="w-full max-w-full overflow-auto">
      <div className="inline-block">
        <svg
          width={width}
          height={height}
          style={{
            backgroundColor: COLORS.background,
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            maxWidth: '100%',
            height: 'auto',
          }}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {Array.from({ length: env.height }, (_, y) =>
            Array.from({ length: env.width }, (_, x) => renderCell(x, y))
          )}
        </svg>
      </div>
    </div>
  );
}

