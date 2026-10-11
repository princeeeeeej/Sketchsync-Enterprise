import { BoundingBox, ResizeHandle, ShapeData, ShapeStyles } from "../types"
import { Shape } from "./Shape"

export class CircleShape extends Shape {
    radius: number
    centerX: number
    centerY: number

    constructor(id: string, style: ShapeStyles, centerX: number, centerY: number, radius: number) {
        super(id, style)
        this.radius = radius
        this.centerX = centerX
        this.centerY = centerY
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        this.apply(ctx)
        ctx.beginPath()
        ctx.arc(this.centerX, this.centerY, Math.abs(this.radius), 0, 2 * Math.PI)
        ctx.stroke();
        if (this.style.fillColor !== "transparent") {
            ctx.fill();
        }
        ctx.restore();
    }

    hitTest(x: number, y: number): boolean {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        return Math.sqrt(dx * dx + dy * dy) <= Math.abs(this.radius);
    }

    translate(dx: number, dy: number): void {
        this.centerX += dx;
        this.centerY += dy;
    }

    resize(handle: ResizeHandle, dx: number, dy: number): void {
        switch (handle) {
            case "e":
                this.centerX += dx / 2;
                this.radius = Math.max(1, this.radius + dx / 2);
                break;
            case "w":
                this.centerX += dx / 2;
                this.radius = Math.max(1, this.radius - dx / 2);
                break;
            case "s":
                this.centerY += dy / 2;
                this.radius = Math.max(1, this.radius + dy / 2);
                break;
            case "n":
                this.centerY += dy / 2;
                this.radius = Math.max(1, this.radius - dy / 2);
                break;
        }
    }

    getBoundingBox(): BoundingBox {
        const r = Math.abs(this.radius)
        return {
            x: this.centerX - r,
            y: this.centerY - r,
            width: r * 2,
            height: r * 2,
        }
    }

    drawSelection(ctx: CanvasRenderingContext2D, zoom: number): void {
        const box = this.getBoundingBox()
        const size = 8 / zoom

        ctx.save()
        ctx.strokeStyle = "#6965db";
        ctx.lineWidth = 1 / zoom
        ctx.setLineDash([])
        ctx.beginPath()
        ctx.strokeRect(
            box.x,
            box.y,
            box.width,
            box.height
        )
        ctx.setLineDash([]);

        ctx.fillStyle = "#ffffff"
        ctx.strokeStyle = "#6965db"
        ctx.lineWidth = 1 / zoom

        const handles = [
            { x: box.x + box.width / 2, y: box.y },
            { x: box.x + box.width, y: box.y + box.height / 2 },
            { x: box.x + box.width / 2, y: box.y + box.height },
            { x: box.x, y: box.y + box.height / 2 },
        ]

        handles.forEach(h => {
            ctx.fillRect(h.x - size / 2, h.y - size / 2, size, size)
            ctx.strokeRect(h.x - size / 2, h.y - size / 2, size, size)
        })
        ctx.restore()
    }

    serialize(): ShapeData {
        return {
            id: this.id,
            type: "circle",
            style: this.style,
            centerX: this.centerX,
            centerY: this.centerY,
            radius: this.radius
        }
    }
}