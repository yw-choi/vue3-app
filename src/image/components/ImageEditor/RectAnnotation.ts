import { Annotation } from "@/image/models/annotation";
import { AnchorPoint } from "./AnchorPoint";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { ContainerConfig } from "konva/lib/Container";
import { ImageEditorController } from "./ImageEditorController";

export class RectAnnotation extends Konva.Group {
  anchors: AnchorPoint[];
  rect?: Konva.Rect;
  drawing: boolean;

  constructor(config?: ContainerConfig) {
    super(config);
    this.anchors = [];
    this.drawing = false;
  }

  static buildFromAnnotationData(a: Annotation): RectAnnotation {
    const points: number[] = [];
    for (const d of a.data) {
      points.push(d.x);
      points.push(d.y);
    }

    const l = new RectAnnotation();

    l.anchors = [
      new AnchorPoint(points[0], points[1]),
      new AnchorPoint(points[2], points[3]),
      new AnchorPoint(points[4], points[5]),
      new AnchorPoint(points[6], points[7])
    ];

    l.rect = new Konva.Rect({
      x: points[0],
      y: points[1],
      width: points[2] - points[0],
      height: points[5] - points[1],
      name: "rect",
      stroke: "lightgreen",
      strokeWidth: 4,
      lineCap: "round",
      lineJoin: "round"
    });

    l.add(l.rect);
    for (const ac of l.anchors) {
      l.add(ac);
    }
    return l;
  }

  static newAnnotation(pos: Vector2d) {
    // first click. create anchors and line
    const g = new RectAnnotation({});

    const p1 = new AnchorPoint(pos.x, pos.y);
    const p2 = new AnchorPoint(pos.x, pos.y);
    const p3 = new AnchorPoint(pos.x, pos.y);
    const p4 = new AnchorPoint(pos.x, pos.y);
    g.anchors = [p1, p2, p3, p4];
    g.rect = new Konva.Rect({
      x: p1.x(),
      y: p1.y(),
      width: 0,
      height: 0,
      name: "rect",
      stroke: "lightgreen",
      strokeWidth: 4,
      lineCap: "round",
      lineJoin: "round"
    });

    g.add(g.rect);
    g.add(p1);
    g.add(p2);
    g.add(p3);
    g.add(p4);
    g.drawing = true;
    return g;
  }

  // handles the second click
  handleClick(pos: Vector2d): boolean {
    this.drawing = false;
    return true;
  }

  handleMousemove(pos: Vector2d) {
    if (this.drawing) {
      this.anchors[1].position({
        x: pos.x,
        y: this.anchors[0].y()
      });
      this.anchors[2].position(pos);
      this.anchors[3].position({
        x: this.anchors[0].x(),
        y: pos.y
      });
      this.update();
    }
  }

  update(): void {
    if (!this.anchors || !this.rect) {
      return;
    }
    this.rect?.position(this.anchors[0].getPosition());
    this.rect?.size({
      width: this.anchors[1].x() - this.anchors[0].x(),
      height: this.anchors[2].y() - this.anchors[1].y()
    });
  }
}
