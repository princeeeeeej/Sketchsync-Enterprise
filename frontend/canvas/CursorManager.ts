import { RemoteCursor } from "./types";

export class CursorManager {
  private cursors: Map<string, RemoteCursor>;

  constructor() {
    this.cursors = new Map();
  }

  private getColor(userId: string): string {
    const COLORS = [
      "#ff6b6b",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#ffeaa7",
      "#dda0dd",
    ];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash >> 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
  }

  update(userId: string, x: number, y: number, name: string): void {
    this.cursors.set(userId, {
      userId,
      x: x,
      y: y,
      name: name,
      color: this.getColor(userId),
      lastSeen: Date.now(),
    });
  }

  remove(userId: string): void {
    this.cursors.delete(userId);
  }

  cleanUp(): void {
    const now = Date.now();
    this.cursors.forEach((cursor, userId) => {
      if (now - cursor.lastSeen > 3000) {
        this.cursors.delete(userId);
      }
    });
  }

  render(ctx: CanvasRenderingContext2D, panX: number, panY: number, zoom: number) {
    this.cursors.forEach((cursor) => {
      const screenX = cursor.x * zoom + panX;
      const screenY = cursor.y * zoom + panY;

      this.drawCursor(ctx, screenX, screenY, cursor.color);

      ctx.save();
      ctx.font = "bold 11px sans-serif";
      const nameWidth = ctx.measureText(cursor.name).width;

      ctx.fillStyle = cursor.color;
      ctx.beginPath();
      ctx.roundRect(screenX + 14, screenY + 14, nameWidth + 10, 20, 4);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.fillText(cursor.name, screenX + 19, screenY + 28);
      ctx.restore();
    });
  }

  private drawCursor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
  ): void {
    ctx.save();
    ctx.beginPath();

    ctx.moveTo(x, y);
    ctx.lineTo(x + 10, y + 10);
    ctx.lineTo(x + 3, y + 8);
    ctx.lineTo(x + 1, y + 14);
    ctx.closePath();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
  }
}
