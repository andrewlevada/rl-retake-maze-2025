import { MazeEnvironment, Action } from './maze-environment';

export class DPAgent {
  private env: MazeEnvironment;
  private gamma: number;
  private numStates: number;
  private numActions: number;
  
  public V: Float64Array; // V[s]
  public P: Float64Array; // P[a][s]

  constructor(env: MazeEnvironment, gamma: number = 0.9) {
    this.env = env;
    this.gamma = gamma;
    this.numStates = env.getNumStates();
    this.numActions = env.getMaxNumActions();

    this.V = new Float64Array(this.numStates);

    this.P = new Float64Array(this.numStates * this.numActions);
    this.initializePolicy();
  }

  private initializePolicy(): void {
    for (let s = 0; s < this.numStates; s++) {
      const actions = this.env.allowedActions(s);
      const prob = actions.length > 0 ? 1.0 / actions.length : 0;
      
      for (let a = 0; a < this.numActions; a++) {
        if (actions.includes(a)) {
          this.P[a * this.numStates + s] = prob;
        } else {
          this.P[a * this.numStates + s] = 0;
        }
      }
    }
  }

  public evaluatePolicy(): void {
    const Vnew = new Float64Array(this.numStates);

    for (let s = 0; s < this.numStates; s++) {
      let v = 0.0;
      const allowedActions = this.env.allowedActions(s);

      for (const a of allowedActions) {
        const prob = this.P[a * this.numStates + s];
        const ns = this.env.nextStateDistribution(s, a);
        const r = this.env.reward(s, a, ns);
        
        v += prob * (r + this.gamma * this.V[ns]);
      }

      Vnew[s] = v;
    }

    this.V = Vnew;
  }

  public updatePolicy(): void {
    for (let s = 0; s < this.numStates; s++) {
      const allowedActions = this.env.allowedActions(s);
      
      if (allowedActions.length === 0) continue;

      const qValues: number[] = [];
      let maxQ = -Infinity;

      for (const a of allowedActions) {
        const ns = this.env.nextStateDistribution(s, a);
        const r = this.env.reward(s, a, ns);
        const q = r + this.gamma * this.V[ns];
        qValues.push(q);
        maxQ = Math.max(maxQ, q);
      }

      let numMax = 0;
      for (const q of qValues) {
        if (Math.abs(q - maxQ) < 1e-10) numMax++;
      }

      for (let i = 0; i < this.numActions; i++) {
        this.P[i * this.numStates + s] = 0;
      }

      const probPerMaxAction = 1.0 / numMax;
      for (let i = 0; i < allowedActions.length; i++) {
        const a = allowedActions[i];
        
        if (Math.abs(qValues[i] - maxQ) < 1e-10) {
          this.P[a * this.numStates + s] = probPerMaxAction;
        }
      }
    }
  }

  public policyIteration(): void {
    this.evaluatePolicy();
    this.updatePolicy();
  }

  public getAction(state: number): Action | null {
    const allowedActions = this.env.allowedActions(state);
    
    if (allowedActions.length === 0) return null;

    let bestAction = allowedActions[0];
    let maxProb = this.P[bestAction * this.numStates + state];

    for (const a of allowedActions) {
      const prob = this.P[a * this.numStates + state];
      if (prob > maxProb) {
        maxProb = prob;
        bestAction = a;
      }
    }

    return bestAction;
  }

  public reset(): void {
    this.V = new Float64Array(this.numStates);
    this.initializePolicy();
  }

  public getActionDistribution(state: number): Map<Action, number> {
    const dist = new Map<Action, number>();
    const allowedActions = this.env.allowedActions(state);

    for (const a of allowedActions) {
      dist.set(a, this.P[a * this.numStates + state]);
    }

    return dist;
  }
}

