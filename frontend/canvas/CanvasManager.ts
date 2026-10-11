import { CursorManager } from "./CursorManager";
import { ShapeFactory } from "./ShapeFactory";
import { CircleShape } from "./shapes/CircleShape";
import { LineShape } from "./shapes/LineShape";
import { PenShape } from "./shapes/PenShape";
import { RectShape } from "./shapes/RectShape";
import { Shape } from "./shapes/Shape";
import { TextShape } from "./shapes/TextShape";
import {
  DEFAULT_STYLE,
  HistoryAction,
  Point,
  ResizeHandle,
  ShapeData,
  ShapeStyles,
  Tool,
} from "./types";

export class CanvasManager {
  private cursorManager: CursorManager;
  private previews: Map<string, Shape>;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shapes: Map<string, Shape>;
  private selectedShape: Shape | null;
  private activeTool: Tool;
  private startX: number = 0;
  private startY: number = 0;
  private panX: number;
  private panY: number;
  private zoom: number;
  private currentStyle: ShapeStyles;

  private isDrawing: boolean;
  private currentShape: Shape | null;
  private currentStroke: Point[];

  private lastRawX: number;
  private lastRawY: number;

  private isResizing: boolean;
  private activeHandle: ResizeHandle | null;
  private resizeStartX: number;
  private resizeStartY: number;
  private resizeStartData: ShapeData | null;

  private moveStartX: number;
  private moveStartY: number;
  private originalShapeData: ShapeData | null;

  private erasedIds: Set<string>;
  private erasedShapes: ShapeData[];

  private undoStack: HistoryAction[];
  private redoStack: HistoryAction[];
  private isExporting: boolean;

  private onShapeChange: (shapes: ShapeData[]) => void;
  private onErase: (ids: string[]) => void;
  private onCursorMove: (x: number, y: number) => void;
  private onTextRequest: (
    canvasX: number,
    canvasY: number,
    screenX: number,
    screenY: number,
  ) => void;
  private onSelectionChange: (
    shapeStyles: ShapeStyles | null,
    shapeType: string | null,
  ) => void;
  private onHistoryChange: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    onShapeChange: (shapes: ShapeData[]) => void,
    onErase: (ids: string[]) => void,
    onCursorMove: (x: number, y: number) => void,
    onTextRequest: (
      canvasX: number,
      canvasY: number,
      screenX: number,
      screenY: number,
    ) => void,
    onSelectionChange: (
      shapeStyles: ShapeStyles | null,
      shapeType: string | null,
    ) => void,
    onHistoryChange: () => void,
  ) {
    this.cursorManager = new CursorManager();
    this.previews = new Map();
    this.canvas = canvas;
    this.currentStyle = DEFAULT_STYLE;
    this.ctx = canvas.getContext("2d")!;
    this.shapes = new Map();
    this.selectedShape = null;
    this.activeTool = "pointer";
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.isDrawing = false;
    this.currentShape = null;
    this.currentStroke = [];
    this.lastRawX = 0;
    this.lastRawY = 0;
    this.moveStartX = 0;
    this.moveStartY = 0;
    this.originalShapeData = null;
    this.erasedIds = new Set();
    this.erasedShapes = [];
    this.isResizing = false;
    this.activeHandle = null;
    this.resizeStartX = 0;
    this.resizeStartY = 0;
    this.resizeStartData = null;
    this.undoStack = [];
    this.redoStack = [];
    this.isExporting = false;
    this.onShapeChange = onShapeChange;
    this.onErase = onErase;
    this.onCursorMove = onCursorMove;
    this.onTextRequest = onTextRequest;
    this.onSelectionChange = onSelectionChange;
    this.onHistoryChange = onHistoryChange;
  }

  toCanvasCoords(screenX: number, screenY: number) {
    return {
      x: (screenX - this.panX) / this.zoom,
      y: (screenY - this.panY) / this.zoom,
    };
  }

  getShape(x: number, y: number): Shape | null {
    const shapesArray = [...this.shapes.values()];
    for (let i = shapesArray.length - 1; i >= 0; i--) {
      if (shapesArray[i].hitTest(x, y)) return shapesArray[i];
    }
    return null;
  }

  setTool(tool: Tool) {
    this.activeTool = tool;
    this.onSelectionChange(null, null);
    this.selectedShape = null;
    this.render();
  }

  addShape(shape: Shape) {
    this.shapes.set(shape.id, shape);
  }

  setStyle(style: Partial<ShapeStyles>): void {
    this.currentStyle = { ...this.currentStyle, ...style };
  }

  getSelectedShapeStyles(): ShapeStyles | null {
    if (!this.selectedShape) return null;
    return { ...this.selectedShape.style };
  }

  getSelectedShape(): Shape | null {
    if (!this.selectedShape) return null;
    return this.selectedShape;
  }

  updateSelectedStyle(style: Partial<ShapeStyles>): void {
    if (!this.selectedShape) return;
    const beforeData = this.selectedShape.serialize();
    this.selectedShape.style = { ...this.selectedShape.style, ...style };
    if (
      this.selectedShape instanceof TextShape &&
      style.fontSize !== undefined
    ) {
      this.selectedShape.fontSize = style.fontSize;
    }
    this.shapes.set(this.selectedShape.id, this.selectedShape);
    const afterData = this.selectedShape.serialize();
    this.render();
    this.onShapeChange([...this.shapes.values()].map((s) => s.serialize()));

    if (this.undoStack.length > 0) {
      const lastAction = this.undoStack[this.undoStack.length - 1];
      if (
        lastAction.type === "modify" &&
        lastAction.after.length === 1 &&
        lastAction.after[0].id === beforeData.id &&
        JSON.stringify({ ...lastAction.before[0], style: undefined }) ===
        JSON.stringify({ ...lastAction.after[0], style: undefined })
      ) {
        lastAction.after = [afterData];
        this.redoStack = [];
        this.onHistoryChange();
        return;
      }
    }

    this.pushAction({
      type: "modify",
      before: [beforeData],
      after: [afterData],
    });
  }

  getActiveHandle(x: number, y: number): ResizeHandle | null {
    if (!this.selectedShape) return null;

    const box = this.selectedShape.getBoundingBox();
    const tolerance = 6 / this.zoom;

    const handles: { name: ResizeHandle; x: number; y: number }[] = [
      { name: "nw", x: box.x, y: box.y },
      { name: "n", x: box.x + box.width / 2, y: box.y },
      { name: "ne", x: box.x + box.width, y: box.y },
      { name: "w", x: box.x, y: box.y + box.height / 2 },
      { name: "sw", x: box.x, y: box.y + box.height },
      { name: "s", x: box.x + box.width / 2, y: box.y + box.height },
      { name: "se", x: box.x + box.width, y: box.y + box.height },
      { name: "e", x: box.x + box.width, y: box.y + box.height / 2 },
    ];

    for (let handle of handles) {
      const dx = x - handle.x;
      const dy = y - handle.y;
      if (Math.sqrt(dx * dx + dy * dy) < tolerance) return handle.name;
    }
    return null;
  }

  getAllShapes(): ShapeData[] {
    return [...this.shapes.values()].map((s) => s.serialize());
  }

  pushAction(action: HistoryAction): void {
    this.undoStack.push(action);
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.onHistoryChange();
  }

  undo(): void {
    const action = this.undoStack.pop();
    if (!action) return;

    switch (action.type) {
      case "add": {
        const ids = action.shapes.map((s) => s.id);
        ids.forEach((id) => {
          this.shapes.delete(id);
          if (this.selectedShape?.id === id) {
            this.selectedShape = null;
            this.onSelectionChange(null, null);
          }
        });
        this.onErase(ids);
        break;
      }
      case "delete": {
        action.shapes.forEach((data) => {
          const shape = ShapeFactory.deserialize(data);
          this.shapes.set(shape.id, shape);
        });
        this.onShapeChange([...this.shapes.values()].map((s) => s.serialize()));
        break;
      }
      case "modify": {
        action.before.forEach((data) => {
          const shape = ShapeFactory.deserialize(data);
          this.shapes.set(shape.id, shape);
          if (this.selectedShape?.id === shape.id) {
            this.selectedShape = shape;
            this.onSelectionChange({ ...shape.style }, shape.serialize().type);
          }
        });
        this.onShapeChange([...this.shapes.values()].map((s) => s.serialize()));
        break;
      }
    }

    this.redoStack.push(action);
    this.render();
    this.onHistoryChange();
  }

  redo(): void {
    const action = this.redoStack.pop();
    if (!action) return;

    switch (action.type) {
      case "add": {
        action.shapes.forEach((data) => {
          const shape = ShapeFactory.deserialize(data);
          this.shapes.set(shape.id, shape);
        });
        this.onShapeChange([...this.shapes.values()].map((s) => s.serialize()));
        break;
      }
      case "delete": {
        const ids = action.shapes.map((s) => s.id);
        ids.forEach((id) => {
          this.shapes.delete(id);
          if (this.selectedShape?.id === id) {
            this.selectedShape = null;
            this.onSelectionChange(null, null);
          }
        });
        this.onErase(ids);
        break;
      }
      case "modify": {
        action.after.forEach((data) => {
          const shape = ShapeFactory.deserialize(data);
          this.shapes.set(shape.id, shape);
          if (this.selectedShape?.id === shape.id) {
            this.selectedShape = shape;
            this.onSelectionChange({ ...shape.style }, shape.serialize().type);
          }
        });
        this.onShapeChange([...this.shapes.values()].map((s) => s.serialize()));
        break;
      }
    }

    this.undoStack.push(action);
    this.render();
    this.onHistoryChange();
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  updateCursor(userId: string, x: number, y: number, name: string): void {
    this.cursorManager.update(userId, x, y, name);
    this.render();
  }

  removeCursor(userId: string) {
    this.cursorManager.remove(userId);
    this.render();
  }

  isCurrentlyDrawing(): boolean {
    if (
      this.activeTool === "pointer" ||
      this.activeTool === "hand" ||
      this.activeTool === "eraser"
    ) {
      return false;
    }
    return this.isDrawing && this.currentShape !== null;
  }

  getCurrentShapeData(): ShapeData | null {
    return this.currentShape?.serialize() ?? null;
  }

  updatePreview(userId: string, data: ShapeData): void {
    if (!data) return;
    const shape = ShapeFactory.deserialize(data);
    this.previews.set(userId, shape);
    this.render();
  }

  clearPreview(userId: string): void {
    this.previews.delete(userId);
    this.render();
  }

  isCurrentlyTransforming(): boolean {
    if (this.activeTool !== "pointer") return false;
    return this.isDrawing && (this.isResizing || this.selectedShape !== null);
  }

  getTransformPreview(): ShapeData | null {
    if (!this.selectedShape) return null;
    return this.selectedShape.serialize();
  }

  clearCanvas(): void {
    const allShapes = [...this.shapes.values()].map((s) => s.serialize());
    if (allShapes.length === 0) return;
    const ids = allShapes.map((s) => s.id);
    this.shapes.clear();
    this.selectedShape = null;
    this.onSelectionChange(null, null);
    this.onErase(ids);
    this.pushAction({
      type: "delete",
      shapes: allShapes,
    });
    this.render();
  }

  private drawGrid() {
    if (!this.ctx || !this.canvas) return;

    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.fillStyle = "#fcfcfb";
    this.ctx.fillRect(0, 0, width, height);

    if (this.isExporting) return;

    this.ctx.fillStyle = "#d4d0cb";
    const currentPanX = this.panX || 0;
    const currentPanY = this.panY || 0;
    const currentZoom = this.zoom || 1;

    let baseGridSize = 24;
    let scaledGridSize = baseGridSize * currentZoom;

    while (scaledGridSize < 15) {
      baseGridSize *= 2;
      scaledGridSize = baseGridSize * currentZoom;
    }
    while (scaledGridSize > 60) {
      baseGridSize /= 2;
      scaledGridSize = baseGridSize * currentZoom;
    }

    const offsetX = currentPanX % scaledGridSize;
    const offsetY = currentPanY % scaledGridSize;

    for (
      let x = offsetX - scaledGridSize;
      x < width + scaledGridSize;
      x += scaledGridSize
    ) {
      for (
        let y = offsetY - scaledGridSize;
        y < height + scaledGridSize;
        y += scaledGridSize
      ) {
        this.ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
  }

  render(): void {
    this.drawGrid();

    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoom, this.zoom);

    const previewedShapeIds = new Set<string>();
    this.previews.forEach((previewShape) => {
      previewedShapeIds.add(previewShape.id);
    });

    this.shapes.forEach((shape) => {
      if (
        this.isDrawing &&
        this.activeTool === "pointer" &&
        this.selectedShape &&
        shape.id === this.selectedShape.id
      ) {
        return;
      }

      if (previewedShapeIds.has(shape.id)) {
        return;
      }

      shape.draw(this.ctx);
    });

    this.ctx.save();
    this.ctx.globalAlpha = 0.5;
    this.previews.forEach((shape) => shape.draw(this.ctx));
    this.ctx.restore();

    if (this.isDrawing && this.activeTool === "pointer" && this.selectedShape) {
      this.selectedShape.draw(this.ctx);
    }

    if (this.selectedShape) {
      this.selectedShape.drawSelection(this.ctx, this.zoom);
    }

    if (this.currentShape) {
      this.currentShape.draw(this.ctx);
    }

    this.ctx.restore();
    this.cursorManager.render(this.ctx, this.panX, this.panY, this.zoom);
  }

  onPointerDown(screenX: number, screenY: number) {
    const { x, y } = this.toCanvasCoords(screenX, screenY);
    console.log(`[Drawing] Pointer Down - Tool: ${this.activeTool}, Screen: (${screenX}, ${screenY}), Canvas: (${Math.round(x)}, ${Math.round(y)})`);

    switch (this.activeTool) {
      case "hand":
        this.lastRawX = screenX;
        this.lastRawY = screenY;
        this.isDrawing = true;
        break;
      case "pointer":
        if (this.selectedShape) {
          const handle = this.getActiveHandle(x, y);
          if (handle) {
            this.isResizing = true;
            this.isDrawing = true;
            this.activeHandle = handle;
            this.resizeStartX = x;
            this.resizeStartY = y;
            this.resizeStartData = JSON.parse(
              JSON.stringify(this.selectedShape.serialize()),
            );
            return;
          }
        }

        const shape = this.getShape(x, y);
        this.selectedShape = shape;
        const handle = this.getActiveHandle(x, y);
        if (shape) {
          this.moveStartX = x;
          this.moveStartY = y;
          this.originalShapeData = shape.serialize();
          this.onSelectionChange({ ...shape.style }, shape.serialize().type);
        } else {
          this.onSelectionChange(null, null);
        }
        this.isDrawing = true;
        this.render();
        break;
      case "eraser":
        this.isDrawing = true;
        this.erasedIds = new Set();
        this.erasedShapes = [];
        break;
      case "pen":
        this.isDrawing = true;
        this.currentShape = ShapeFactory.create("pen", x, y, this.currentStyle);
        break;
      case "text":
        const screenXText = x * this.zoom + this.panX;
        const screenYText = y * this.zoom + this.panY;
        this.onTextRequest(x, y, screenXText, screenYText);
        break;
      default:
        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
        this.currentShape = ShapeFactory.create(
          this.activeTool,
          x,
          y,
          this.currentStyle,
        );
        break;
    }
  }

  onPointerMove(screenX: number, screenY: number) {
    if (!this.isDrawing) return;
    const { x, y } = this.toCanvasCoords(screenX, screenY);
    console.log(`[Drawing] Pointer Move - Tool: ${this.activeTool}, Canvas: (${Math.round(x)}, ${Math.round(y)})`);

    switch (this.activeTool) {
      case "hand":
        this.panX += screenX - this.lastRawX;
        this.panY += screenY - this.lastRawY;
        this.lastRawX = screenX;
        this.lastRawY = screenY;
        this.render();
        break;
      case "pointer":
        if (
          this.isResizing &&
          this.activeHandle &&
          this.selectedShape &&
          this.resizeStartData
        ) {
          const dx = x - this.resizeStartX;
          const dy = y - this.resizeStartY;
          const fresh = ShapeFactory.deserialize(
            JSON.parse(JSON.stringify(this.resizeStartData)),
          );
          fresh.resize(this.activeHandle, dx, dy);
          this.shapes.set(fresh.id, fresh);
          this.selectedShape = fresh;
          this.render();
          break;
        }

        if (!this.selectedShape || !this.originalShapeData) break;
        let dx = x - this.moveStartX;
        let dy = y - this.moveStartY;
        let fresh = ShapeFactory.deserialize(
          JSON.parse(JSON.stringify(this.originalShapeData)),
        );
        fresh.translate(dx, dy);
        this.shapes.set(fresh.id, fresh);
        this.selectedShape = fresh;
        this.render();
        break;
      case "pen":
        if (!this.currentShape) break;
        const pen = this.currentShape as PenShape;
        pen.points.push({ x, y });
        this.render();
        break;
      case "eraser":
        const shape = this.getShape(x, y);
        if (shape && !this.erasedIds.has(shape.id)) {
          this.erasedShapes.push(shape.serialize());
          this.shapes.delete(shape.id);
          this.erasedIds.add(shape.id);
          if (this.selectedShape?.id === shape.id) {
            this.selectedShape = null;
            this.onSelectionChange(null, null);
          }
          this.render();
        }
        break;
      default:
        if (!this.currentShape) break;
        const width = x - this.startX;
        const height = y - this.startY;
        if (this.activeTool === "rect") {
          const rect = this.currentShape as RectShape;
          rect.width = width;
          rect.height = height;
        } else if (this.activeTool === "circle") {
          const circle = this.currentShape as CircleShape;
          circle.radius = Math.sqrt(width * width + height * height) / 2;
          circle.centerX = this.startX + width / 2;
          circle.centerY = this.startY + height / 2;
        } else if (this.activeTool === "line") {
          const line = this.currentShape as LineShape;
          line.x2 = x;
          line.y2 = y;
        }
        this.render();
        break;
    }
  }

  onPointerUp(screenX: number, screenY: number) {
    if (!this.isDrawing) return;
    const { x, y } = this.toCanvasCoords(screenX, screenY);
    console.log(`[Drawing] Pointer Up - Tool: ${this.activeTool}, Canvas: (${Math.round(x)}, ${Math.round(y)})`);
    switch (this.activeTool) {
      case "hand":
        this.isDrawing = false;
        break;
      case "pointer":
        if (this.isResizing) {
          this.isResizing = false;
          this.activeHandle = null;
          if (this.selectedShape && this.resizeStartData) {
            const currentData = this.selectedShape.serialize();
            if (
              JSON.stringify(this.resizeStartData) !==
              JSON.stringify(currentData)
            ) {
              this.pushAction({
                type: "modify",
                before: [this.resizeStartData],
                after: [currentData],
              });
              this.onShapeChange(
                [...this.shapes.values()].map((s) => s.serialize()),
              );
            }
          }
          this.resizeStartData = null;
          this.isDrawing = false;
          break;
        }
        this.isDrawing = false;
        if (this.selectedShape && this.originalShapeData) {
          const currentData = this.selectedShape.serialize();
          if (
            JSON.stringify(this.originalShapeData) !==
            JSON.stringify(currentData)
          ) {
            this.pushAction({
              type: "modify",
              before: [this.originalShapeData],
              after: [currentData],
            });
            this.onShapeChange(
              [...this.shapes.values()].map((s) => s.serialize()),
            );
          }
        }
        this.originalShapeData = null;
        break;
      case "pen":
        if (!this.currentShape) break;
        const pen = this.currentShape as PenShape;
        pen.points.push({ x, y });
        this.shapes.set(this.currentShape.id, this.currentShape);
        const serializedPen = this.currentShape.serialize();
        this.onShapeChange([...this.shapes.values()].map((s) => s.serialize()));
        this.pushAction({
          type: "add",
          shapes: [serializedPen],
        });
        this.currentShape = null;
        this.currentStroke = [];
        this.isDrawing = false;
        this.render();
        break;
      case "eraser":
        this.isDrawing = false;
        if (this.erasedIds.size > 0) {
          this.onErase([...this.erasedIds]);
          this.pushAction({
            type: "delete",
            shapes: [...this.erasedShapes],
          });
          this.erasedIds = new Set();
          this.erasedShapes = [];
        }
        break;
      case "text":
        this.isDrawing = false;
        break;
      default:
        if (!this.currentShape) break;
        const width = x - this.startX;
        const height = y - this.startY;

        if (this.activeTool === "line") {
          const line = this.currentShape as LineShape;
          const dist = Math.hypot(x - this.startX, y - this.startY);
          if (dist < 3) {
            this.currentShape = null;
            this.isDrawing = false;
            this.render();
            break;
          }
          line.x2 = x;
          line.y2 = y;
        } else {
          if (Math.abs(width) < 3 && Math.abs(height) < 3) {
            this.currentShape = null;
            this.isDrawing = false;
            this.render();
            break;
          }
          if (this.activeTool === "rect") {
            const rect = this.currentShape as RectShape;
            rect.width = width;
            rect.height = height;
          } else if (this.activeTool === "circle") {
            const circle = this.currentShape as CircleShape;
            circle.radius = Math.sqrt(width * width + height * height) / 2;
            circle.centerX = this.startX + width / 2;
            circle.centerY = this.startY + height / 2;
          }
        }
        this.shapes.set(this.currentShape.id, this.currentShape);
        const serializedShape = this.currentShape.serialize();
        this.onShapeChange([...this.shapes.values()].map((s) => s.serialize()));
        this.pushAction({
          type: "add",
          shapes: [serializedShape],
        });
        this.currentShape = null;
        this.isDrawing = false;
        this.render();
        break;
    }
  }

  onRemoteDraw(elements: ShapeData[]): void {
    console.log(`[Drawing] Remote Draw - Received elements:`, elements);
    elements.forEach((data) => {
      const shape = ShapeFactory.deserialize(data);
      this.shapes.set(shape.id, shape);
    });
    this.render();
  }

  onRemoteErase(ids: string[]) {
    console.log(`[Drawing] Remote Erase - Received IDs:`, ids);
    ids.forEach((id) => this.shapes.delete(id));
    this.render();
  }

  loadShapes(elements: ShapeData[] | undefined): void {
    if (!elements) return;
    this.shapes.clear();
    elements.forEach((data) => {
      const shape = ShapeFactory.deserialize(data);
      this.shapes.set(shape.id, shape);
    });
    this.undoStack = [];
    this.redoStack = [];
    this.onHistoryChange();
    this.render();
  }

  zoomAt(screenX: number, screenY: number, factor: number) {
    this.panX = screenX - (screenX - this.panX) * factor;
    this.panY = screenY - (screenY - this.panY) * factor;
    this.zoom = Math.min(Math.max(this.zoom * factor, 0.05), 20);
    this.render();
  }

  public exportPNG(roomName: string = "board"): void {
    if (!this.canvas) return;
    this.isExporting = true;
    this.render();
    const dataUrl = this.canvas.toDataURL("image/png");
    this.isExporting = false;
    this.render();
    const link = document.createElement("a");
    link.download = `SketchSync-${roomName}-${Date.now()}.png`;
    link.href = dataUrl;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  commitText(canvasX: number, canvasY: number, text: string): void {
    if (!text.trim()) return;
    const shape = ShapeFactory.create(
      "text",
      canvasX,
      canvasY,
      this.currentStyle,
    ) as TextShape;
    shape.text = text;
    shape.fontSize = this.currentStyle.fontSize ?? 16;
    this.shapes.set(shape.id, shape);
    const serialized = shape.serialize();
    this.onShapeChange([...this.shapes.values()].map((s) => s.serialize()));
    this.pushAction({
      type: "add",
      shapes: [serialized],
    });
    this.render();
  }
}