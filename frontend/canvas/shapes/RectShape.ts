import { BoundingBox, ResizeHandle, ShapeData, ShapeStyles } from "../types";
import { Shape } from "./Shape";

export class RectShape extends Shape {
    x: number
    y: number
    height: number
    width: number

    constructor(id: string, style: ShapeStyles, x: number, y: number, width: number, height: number) {
        super(id, style)
        this.x = x
        this.y = y
        this.height = height
        this.width = width
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        this.apply(ctx)
        ctx.beginPath()
        ctx.rect(this.x, this.y, this.width, this.height)
        if (this.style.fillColor !== "transparent") {
            ctx.fill();
        }
        ctx.stroke()
        ctx.restore()
    }

    hitTest(x: number, y: number): boolean {
        const minX = Math.min(this.x, this.x + this.width)
        const maxX = Math.max(this.x, this.x + this.width)
        const minY = Math.min(this.y, this.y + this.height)
        const maxY = Math.max(this.y, this.y + this.height)

        return x >= minX && x <= maxX && y >= minY && y <= maxY
    }

    translate(dx: number, dy: number): void {
        this.x += dx
        this.y += dy
    }

    resize(handle: ResizeHandle, dx: number, dy: number): void {
        switch (handle) {
            case "se":
                this.width += dx;
                this.height += dy;
                break
            case "sw":
                this.x += dx;
                this.width -= dx
                this.height += dy
                break
            case "ne":
                this.y += dy
                this.width += dx
                this.height -= dy
                break
            case "nw":
                this.x += dx
                this.y += dy
                this.width -= dx
                this.height -= dy
                break
            case "n":
                this.y += dy
                this.height -= dy
                break
            case "s":
                this.height += dy
                break
            case "e":
                this.width += dx
                break
            case "w":
                this.x += dx;
                this.width -= dx;
                break;
        }
    }

    getBoundingBox(): BoundingBox {
        return {
            x: Math.min(this.x, this.x + this.width),
            y: Math.min(this.y, this.y + this.height),
            width: Math.abs(this.width),
            height: Math.abs(this.height),
        };
    }

    drawSelection(ctx: CanvasRenderingContext2D, zoom: number): void {
        const box = this.getBoundingBox()
        const padding = 4 / zoom
        const size = 8 / zoom

        ctx.save()
        ctx.strokeStyle = "#6965db";
        ctx.lineWidth = 1 / zoom
        ctx.setLineDash([])
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
            { x: box.x, y: box.y },
            { x: box.x + box.width / 2, y: box.y },
            { x: box.x + box.width, y: box.y },
            { x: box.x + box.width, y: box.y + box.height / 2 },
            { x: box.x + box.width, y: box.y + box.height },
            { x: box.x + box.width / 2, y: box.y + box.height },
            { x: box.x, y: box.y + box.height },
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
            type: "rect",
            style: this.style,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        }
    }
}