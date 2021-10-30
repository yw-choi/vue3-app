import { Annotation } from "@/image/models/annotation";
import { AnchorPoint } from "./AnchorPoint";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { ContainerConfig } from "konva/lib/Container";
import { ImageEditorController } from "./ImageEditorController";

export class LineAnnotation extends Konva.Group {
  anchors: AnchorPoint[];
  line?: Konva.Line;
  drawing: boolean;

  constructor(config?: ContainerConfig) {
    super(config);
    this.anchors = [];
    this.drawing = false;
  }

  static buildFromAnnotationData(a: Annotation): LineAnnotation {
    if (a.data.length != 2) {
      throw new Error("invalid annotation data");
    }

    const points: number[] = [];
    for (const d of a.data) {
      points.push(d.x);
      points.push(d.y);
    }

    const l = new LineAnnotation();

    l.line = new Konva.Line({
      name: "line",
      stroke: "lightgreen",
      strokeWidth: 4,
      lineCap: "round",
      lineJoin: "round",
      points: points
    });

    l.anchors = [new AnchorPoint(points[0], points[1]), new AnchorPoint(points[2], points[3])];

    l.add(l.line);
    for (const ac of l.anchors) {
      l.add(ac);
    }
    return l;
  }

  static newAnnotation(pos: Vector2d) {
    // first click. create anchors and line
    const g = new LineAnnotation({});

    g.line = new Konva.Line({
      stroke: "lightgreen",
      strokeWidth: 4,
      lineCap: "round",
      lineJoin: "round",
      points: [pos.x, pos.y, pos.x, pos.y]
    });

    const p1 = new AnchorPoint(pos.x, pos.y);
    const p2 = new AnchorPoint(pos.x, pos.y);
    g.anchors = [p1, p2];
    g.add(g.line);
    g.add(p1);
    g.add(p2);
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
      this.anchors[1].position(pos);
      this.update();
    }
  }

  update(): void {
    if (!this.anchors || !this.line) {
      return;
    }
    const pos1 = this.anchors[0].getPosition();
    const pos2 = this.anchors[1].getPosition();
    this.line.points([pos1.x, pos1.y, pos2.x, pos2.y]);
  }
}
