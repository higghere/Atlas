import { OrganNode, SystemNode, Blood, LabReport, SimulationEvent } from '../../types/physiology';

export interface RecordedState {
  tick: number;
  timestamp: string;
  organs: Record<string, OrganNode>;
  systems: Record<string, SystemNode>;
  blood: Blood;
  events: any[]; // serialized simple events
  labs: LabReport | null;
  logs: string[];
}

export class SimulationRecorder {
  private history: RecordedState[] = [];

  public record(
    tick: number,
    timestamp: string,
    organs: Record<string, OrganNode>,
    systems: Record<string, SystemNode>,
    blood: Blood,
    events: SimulationEvent[],
    labs: LabReport | null,
    logs: string[]
  ): void {
    // Deep clone states to avoid mutation in timeline references
    const stateCopy: RecordedState = {
      tick,
      timestamp,
      organs: JSON.parse(JSON.stringify(organs)),
      systems: JSON.parse(JSON.stringify(systems)),
      blood: JSON.parse(JSON.stringify(blood)),
      events: events.map(e => ({
        id: e.id,
        name: e.name,
        priority: e.priority,
        targetType: e.targetType,
        targetId: e.targetId,
        ticksRemaining: e.ticksRemaining,
        description: e.description
      })),
      labs: labs ? JSON.parse(JSON.stringify(labs)) : null,
      logs: [...logs]
    };

    // Replace if tick already exists (e.g. rewrote timeline), otherwise push
    const index = this.history.findIndex(h => h.tick === tick);
    if (index !== -1) {
      this.history[index] = stateCopy;
    } else {
      this.history.push(stateCopy);
    }
  }

  public getHistory(): RecordedState[] {
    return this.history;
  }

  public getStateAtTick(tick: number): RecordedState | null {
    const state = this.history.find(h => h.tick === tick);
    return state ? JSON.parse(JSON.stringify(state)) : null;
  }

  public clear(): void {
    this.history = [];
  }

  public exportTimeline(): string {
    return JSON.stringify(this.history, null, 2);
  }

  public importTimeline(jsonString: string): void {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        this.history = parsed;
      }
    } catch (e) {
      console.error("Failed to import timeline", e);
    }
  }
}
