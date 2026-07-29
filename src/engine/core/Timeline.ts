export class Timeline {
  public static tickToTimeStr(ticks: number, scale: 'hours' | 'days' | 'months' | 'years' = 'hours'): string {
    if (ticks === 0) return "Baseline (Day 0)";
    
    // Assume 1 tick = 1 hour in default simulation mode
    const hoursTotal = ticks;
    
    const years = Math.floor(hoursTotal / (24 * 365));
    const remainderYears = hoursTotal % (24 * 365);
    
    const months = Math.floor(remainderYears / (24 * 30));
    const remainderMonths = remainderYears % (24 * 30);
    
    const weeks = Math.floor(remainderMonths / (24 * 7));
    const remainderWeeks = remainderMonths % (24 * 7);
    
    const days = Math.floor(remainderWeeks / 24);
    const hours = remainderWeeks % 24;

    const parts: string[] = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (weeks > 0) parts.push(`${weeks}w`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || parts.length === 0) parts.push(`${hours}h`);

    return parts.join(" ");
  }

  public static getScaleDuration(ticks: number): string {
    return this.tickToTimeStr(ticks);
  }
}
