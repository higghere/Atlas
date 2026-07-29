import { SimulationEvent, EventPriority } from '../../types/physiology';

export class EventQueue {
  private events: SimulationEvent[] = [];

  public addEvent(event: SimulationEvent): void {
    this.events.push(event);
  }

  public getEventsByPriority(priorities: EventPriority[]): SimulationEvent[] {
    return this.events.filter(e => priorities.includes(e.priority));
  }

  public getActiveEvents(): SimulationEvent[] {
    return this.events.filter(e => e.ticksRemaining <= 0);
  }

  public tick(): void {
    // Process timed events (delayed/scheduled) by decrementing ticksRemaining
    this.events.forEach(e => {
      if (e.ticksRemaining > 0) {
        e.ticksRemaining--;
      }
    });
  }

  public clear(): void {
    this.events = [];
  }

  public removeEvent(id: string): void {
    this.events = this.events.filter(e => e.id !== id);
  }

  public getAll(): SimulationEvent[] {
    return this.events;
  }
}
