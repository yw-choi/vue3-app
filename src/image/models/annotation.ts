import { Label } from "./label";
import { Point } from "./point";

export enum ANNOTATIONS_TYPE {
  NONE = "none",
  RECT = "rect",
  LINE = "line",
  POINT = "point",
  POLYGON = "polygon"
}

class Annotation {
  type: string = ANNOTATIONS_TYPE.NONE;
  id: string = "";
  imageId: string = "";
  labelId: string = "";
  data: Point[] = [];

  static buildFromObject(d: object) {
    const a = new Annotation();
    a.id = d["_id"];
    a.type = d["type"];
    a.imageId = d["image"];
    a.labelId = d["label"];
    for (const p of d["data"]) {
      a.data.push(new Point(p[0], p[1]));
    }
    return a;
  }

  toJson() {
    const d: any = [];
    for (const dd of this.data) {
      d.push([dd.x, dd.y]);
    }
    return {
      id: this.id,
      type: this.type,
      imageId: this.imageId,
      labelId: this.labelId,
      data: d
    };
  }
}

export { Annotation };
