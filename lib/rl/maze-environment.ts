export interface Position {
  x: number;
  y: number;
}

export enum CellType {
  Empty = 0,
  Wall = 1,
  Start = 2,
  Goal = 3,
}

export enum Action {
  Up = 0,
  Right = 1,
  Down = 2,
  Left = 3,
  Stay = 4,
}

export class MazeEnvironment {
  public readonly width: number;
  public readonly height: number;
  public readonly grid: CellType[][];
  public readonly startState: number;
  public readonly goalState: number;
  private rewards: Map<number, number>;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grid = this.initializeGrid();
    this.rewards = new Map();
    
    this.startState = this.posToState(0, 0);
    this.goalState = this.posToState(width - 1, height - 1);
    
    this.setReward(this.goalState, 1.0);
  }

  private initializeGrid(): CellType[][] {
    const grid: CellType[][] = [];
    
    for (let y = 0; y < this.height; y++) {
      grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        grid[y][x] = CellType.Empty;
      }
    }

    for (let y = 2; y < this.height - 2; y++) {
      if (y !== 5 && y !== this.height - 5) {
        grid[y][3] = CellType.Wall;
        grid[y][7] = CellType.Wall;
        grid[y][12] = CellType.Wall;
        grid[y][16] = CellType.Wall;
      }
    }

    for (let x = 1; x < this.width - 1; x++) {
      if (x !== 3 && x !== 7 && x !== 12 && x !== 16) {
        if (this.height > 4) grid[3][x] = CellType.Wall;
        if (this.height > 6) grid[6][x] = CellType.Wall;
      }
    }

    const obstaclePositions = [
      [5, 1], [9, 2], [14, 1], [18, 2],
      [2, 5], [10, 5], [15, 4],
      [1, 8], [8, 7], [13, 8], [17, 7],
    ];

    obstaclePositions.forEach(([x, y]) => {
      if (y < this.height && x < this.width) {
        grid[y][x] = CellType.Wall;
      }
    });

    grid[0][0] = CellType.Start;
    grid[this.height - 1][this.width - 1] = CellType.Goal;

    return grid;
  }

  public getNumStates(): number {
    return this.width * this.height;
  }

  public getMaxNumActions(): number {
    return 5;
  }

  public posToState(x: number, y: number): number {
    return y * this.width + x;
  }

  public stateToPos(state: number): Position {
    return {
      x: state % this.width,
      y: Math.floor(state / this.width),
    };
  }

  public isWall(x: number, y: number): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return true;
    }
    return this.grid[y][x] === CellType.Wall;
  }

  public allowedActions(state: number): Action[] {
    const pos = this.stateToPos(state);
    const actions: Action[] = [];

    if (!this.isWall(pos.x, pos.y - 1)) actions.push(Action.Up);
    if (!this.isWall(pos.x + 1, pos.y)) actions.push(Action.Right);
    if (!this.isWall(pos.x, pos.y + 1)) actions.push(Action.Down);
    if (!this.isWall(pos.x - 1, pos.y)) actions.push(Action.Left);
    actions.push(Action.Stay);

    return actions;
  }

  public nextStateDistribution(state: number, action: Action): number {
    const pos = this.stateToPos(state);
    let newX = pos.x;
    let newY = pos.y;

    switch (action) {
      case Action.Up:
        newY -= 1;
        break;
      case Action.Right:
        newX += 1;
        break;
      case Action.Down:
        newY += 1;
        break;
      case Action.Left:
        newX -= 1;
        break;
      case Action.Stay:
        break;
    }

    if (this.isWall(newX, newY)) {
      return state;
    }

    return this.posToState(newX, newY);
  }

  public reward(state: number, action: Action, nextState: number): number {
    if (this.rewards.has(nextState)) {
      return this.rewards.get(nextState)!;
    }

    return -0.01;
  }

  public setReward(state: number, reward: number): void {
    this.rewards.set(state, reward);
  }

  public getReward(state: number): number {
    return this.rewards.get(state) ?? -0.01;
  }

  public isGoalState(state: number): boolean {
    return state === this.goalState;
  }
}

