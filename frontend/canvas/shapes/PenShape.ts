import { BoundingBox, Point, ResizeHandle, ShapeData, ShapeStyles } from "../types";
import { Shape } from "./Shape";

export class PenShape extends Shape {
    points: Point[]

    constructor(id: string, style: ShapeStyles, points: Point[]) {
        super(id, style)
        this.points = points
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        this.apply(ctx)
        ctx.beginPath()
        ctx.moveTo(this.points[0].x, this.points[0].y)
        this.points.forEach((p) => ctx.lineTo(p.x, p.y))
        ctx.stroke();
        ctx.restore();
    }

    hitTest(x: number, y: number): boolean {
        return this.points.some((p) => Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2) < 8);
    }

    translate(dx: number, dy: number): void {
        this.points = this.points.map((p) => ({
            x: p.x + dx,
            y: p.y + dy
        }))
    }

    resize(handle: ResizeHandle, dx: number, dy: number): void {
        const box = this.getBoundingBox()

        let { x, y, height, width } = box

        if (handle.includes("e")) width += dx
        if (handle.includes("s")) height += dy
        if (handle.includes("w")) { x += dx; width -= dx }
        if (handle.includes("n")) { y += dy; height -= dy }
        if (width < 10 || height < 10) return

        this.points = this.points.map((p) => ({
            x: x + ((p.x - box.x) / box.width) * width,
            y: y + ((p.y - box.y) / box.height) * height,
        }))
    }

    getBoundingBox(): BoundingBox {
        const xs = this.points.map(p => p.x)
        const ys = this.points.map(p => p.y)
        return {
            x: Math.min(...xs),
            y: Math.min(...ys),
            width: Math.max(...xs) - Math.min(...xs),
            height: Math.max(...ys) - Math.min(...ys)
        }
    }

    drawSelection(ctx: CanvasRenderingContext2D, zoom: number): void {
        const box = this.getBoundingBox()
        const size = 8 / zoom
        ctx.save()
        ctx.strokeStyle = "#6965db";
        ctx.lineWidth = 1 / zoom
        ctx.setLineDash([])
        ctx.strokeRect(box.x, box.y, box.width, box.height)
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
            style: this.style,
            type: "pen",
            points: this.points
        }
    }
}