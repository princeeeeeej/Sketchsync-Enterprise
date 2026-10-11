import { BoundingBox, ResizeHandle, ShapeData, ShapeStyles } from "../types";
import { Shape } from "./Shape";

export class TextShape extends Shape {
    text: string
    x: number
    y: number
    fontSize: number

    constructor(id: string, style: ShapeStyles, x: number, y: number, text: string, fontSize: number) {
        super(id, style)
        this.x = x
        this.y = y
        this.text = text
        this.fontSize = fontSize
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save()
        this.apply(ctx)
        ctx.font = `${this.fontSize}px ${this.style.fontFamily}`
        ctx.fillStyle = this.style.strokeColor

        this.text.split("\n").forEach((line, i) => {
            ctx.fillText(line, this.x, this.y + i * this.fontSize * 1.2)
        })
        ctx.restore()
    }

    hitTest(x: number, y: number): boolean {
        const approxWidth = this.text.length * this.fontSize * 0.6
        const height = this.text.split("\n").length * this.fontSize * 1.2

        return x >= this.x && x <= this.x + approxWidth && y >= this.y - this.fontSize && y <= this.y + height
    }

    translate(dx: number, dy: number): void {
        this.x += dx
        this.y += dy
    }

    resize(handle: ResizeHandle, dx: number, dy: number): void {
        switch (handle) {
            case "ne":
                this.fontSize = Math.max(8, this.fontSize - dy * 0.5);
                this.y += dy;
                break;
        }
    }

    getBoundingBox(): BoundingBox {
        const lines = this.text.split("\n")
        const approxWidth = Math.max(...lines.map(l => l.length)) * this.fontSize * 0.6
        const height = lines.length * this.fontSize * 1.2
        return {
            x: this.x,
            y: this.y - this.fontSize,
            width: approxWidth,
            height
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
            { x: box.x + box.width, y: box.y },
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
            type: "text",
            text: this.text,
            x: this.x,
            y: this.y,
            fontSize: this.fontSize
        }
    }
}