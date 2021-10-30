import { Annotation } from "@/image/models/annotation";
import { AnchorPoint } from "./AnchorPoint";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { ContainerConfig } from "konva/lib/Container";

export class PolygonAnnotation extends Konva.Group {
  anchors: AnchorPoint[];
  lines: Konva.Line[];
  drawing: boolean;

  constructor(config?: ContainerConfig) {
    super(config);
    this.anchors = [];
    this.lines = [];
    this.drawing = false;
  }

  static buildFromAnnotationData(a: Annotation): PolygonAnnotation {
    const l = new PolygonAnnotation();

    const points: number[] = [];
    for (const d of a.data) {
      points.push(d.x);
      points.push(d.y);
      l.anchors.push(new AnchorPoint(d.x, d.y));
    }

    for (let i = 0; i < a.data.length - 1; i++) {
      l.lines.push(
        new Konva.Line({
          name: "polygon",
          stroke: "lightgreen",
          strokeWidth: 4,
          lineCap: "round",
          lineJoin: "round",
          points: [a.data[i].x, a.data[i].y, a.data[i + 1].x, a.data[i + 1].y]
        })
      );
    }

    for (const a of l.lines) {
      l.add(a);
    }

    for (const a of l.anchors) {
      l.add(a);
    }

    return l;
  }

  static newAnnotation(pos: Vector2d) {
    // first click. create anchors and line
    const g = new PolygonAnnotation({});

    g.lines.push(
      new Konva.Line({
        stroke: "lightgreen",
        strokeWidth: 4,
        lineCap: "round",
        lineJoin: "round",
        points: [pos.x, pos.y, pos.x, pos.y]
      })
    );

    const p1 = new AnchorPoint(pos.x, pos.y);
    p1.name("first-anchor");
    const p2 = new AnchorPoint(pos.x, pos.y);
    g.anchors = [p1, p2];
    g.add(g.lines[0]);
    g.add(p1);
    g.add(p2);
    g.drawing = true;
    return g;
  }

  handleClick(shape, pos: Vector2d): boolean {
    const lastAnchor = this.anchors[this.anchors.length - 1];

    const firstAnchors = this.anchors[0];
    console.log("click", shape.name(), firstAnchors.name());

    const dx = firstAnchors.position().x - pos.x;
    const dy = firstAnchors.position().y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) {
      this.anchors[this.anchors.length - 1].position(firstAnchors.position());
      this.update();
      console.log("finish drawing");
      this.drawing = false;
      return true;
    } else {
      const l = new Konva.Line({
        stroke: "lightgreen",
        strokeWidth: 4,
        lineCap: "round",
        lineJoin: "round",
        points: [lastAnchor.x(), lastAnchor.y(), pos.x, pos.y]
      });
      this.lines.push(l);
      this.add(l);

      console.log("continue drawing");
      this.drawing = true;
      const p1 = new AnchorPoint(pos.x, pos.y);
      this.anchors.push(p1);
      this.add(p1);
      return false;
    }
  }

  handleMousemove(pos: Vector2d) {
    if (this.drawing) {
      this.anchors[this.anchors.length - 1].position(pos);
      this.update();
    }
  }

  update() {
    if (!this.anchors || !this.lines) {
      return;
    }
    if (this.anchors.length < 2) {
      return;
    }
    const pos1 = this.anchors[this.anchors.length - 2].getPosition();
    const pos2 = this.anchors[this.anchors.length - 1].getPosition();
    this.lines[this.lines.length - 1].points([pos1.x, pos1.y, pos2.x, pos2.y]);
  }
}
