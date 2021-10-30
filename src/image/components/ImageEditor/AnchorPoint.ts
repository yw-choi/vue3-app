import Konva from "konva";

export class AnchorPoint extends Konva.Circle {
  constructor(x: number, y: number) {
    super({
      radius: 6,
      x: x,
      y: y,
      fill: "#03dffc"
    });

    this.on("mouseenter", () => {
      const container = this.getStage()?.container();
      if (container) {
        container.style.cursor = "pointer";
      }
    });
    this.on("mouseleave", () => {
      const container = this.getStage()?.container();
      if (container) {
        container.style.cursor = "default";
      }
    });
  }
}
