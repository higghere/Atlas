export class HighlightManager {
  private hoveredId: string | null = null;

  public setHovered(id: string | null) {
    this.hoveredId = id;
  }

  public getHovered(): string | null {
    return this.hoveredId;
  }

  public getHighlightStyle(id: string, isSelected: boolean, isHovered: boolean) {
    if (isSelected) {
      return {
        stroke: '#f43f5e',
        strokeWidth: 3,
        filter: 'drop-shadow(0px 0px 6px #f43f5e)',
        opacity: 1.0,
      };
    }
    if (isHovered) {
      return {
        stroke: '#38bdf8',
        strokeWidth: 2.5,
        filter: 'drop-shadow(0px 0px 4px #38bdf8)',
        opacity: 1.0,
      };
    }
    return {
      opacity: 0.85,
    };
  }
}
