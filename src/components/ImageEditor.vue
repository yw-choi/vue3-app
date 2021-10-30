<template>
  <div class="image-editor">
    <div class="image-editor-toolbar top">
      <div class="btn-group">
        <image-editor-tool-button icon="bi bi-zoom-in" @click.prevent="canvas.zoom(+10)" />
        <image-editor-tool-button icon="bi bi-zoom-out" @click.prevent="canvas.zoom(-10)" />
        <image-editor-tool-button icon="bi bi-aspect-ratio" @click.prevent="canvas.fitToScreen()" />
        <image-editor-tool-button icon="bi bi-border-width" @click.prevent="canvas.addLine()" />
        <image-editor-tool-button icon="bi bi-bounding-box-circles" @click.prevent="canvas.addRect()" />
        <image-editor-tool-button icon="bi bi-circle" @click.prevent="canvas.addCircle()" />
        <!-- <image-editor-tool-button
          icon="bi bi-arrows-move"
          @click.prevent="canvas.toggleDraggable()"
        /> -->
      </div>
    </div>
    <div class="image-editor-content canvas-container"></div>
    <div class="image-editor-toolbar bottom">
      <!-- {{ activeEditorImage.originalName }} -->
    </div>
  </div>
</template>

<script lang="ts">
import { Image } from "@/models/image";
import { key } from "@/store";
import { UIState } from "@/store/ui.store";
import { defineComponent, onMounted } from "@vue/runtime-core";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import ResizeObserver from "resize-observer-polyfill";
import { computed, ref, toRef, watch } from "vue";
import { useStore } from "vuex";
import ImageEditorToolButton from "./ImageEditorToolButton.vue";

export default defineComponent({
  components: { ImageEditorToolButton },
  setup() {
    // @TODO is it ok to make the whole canvas object reactive? maybe performance issue?
    const canvas = ref<CanvasWrapper | null>(null);
    const store = useStore(key);

    // watch UI state change and adjust canvas size
    const ui = computed<UIState>(() => store.state.ui);
    watch(
      ui,
      newVal => {
        canvas.value?.adjustCanvasSize(newVal);
      },
      { deep: true }
    );

    // watch active editor image change
    const activeEditorImage = toRef(store.state.image, "activeEditorImage");
    watch(activeEditorImage, newVal => {
      canvas.value?.setImage(newVal);
    });

    onMounted(() => {
      // setup konva
      canvas.value = new CanvasWrapper({
        container: ".canvas-container"
      });

      // resize canvas when the document is resized
      const resizeObserver = new ResizeObserver(entries => {
        canvas.value?.adjustCanvasSize(ui.value);
      });

      resizeObserver.observe(document.body);
    });

    return {
      activeEditorImage,
      canvas
    };
  },
  mounted() {}
});

// Konva wrapper
class CanvasWrapper {
  stage: Konva.Stage;
  layer: Konva.Layer;
  annotationLayer: Konva.Layer;
  image: Konva.Image;
  draggable: boolean = false;
  isDrawing: boolean = false;
  el: HTMLElement | null = null;

  constructor(config: any) {
    this.stage = new Konva.Stage(config);
    this.layer = new Konva.Layer();
    this.image = new Konva.Image({ image: undefined });
    this.annotationLayer = new Konva.Layer();
    this.addAnnotationEventListeners();
    // this.addMouseTracker();
    this.el = document.querySelector(".image-editor-toolbar.bottom");
  }
  public toggleDraggable() {}

  public zoom(percent: number, centerPointer: boolean = false) {
    const scaleBy = 1 + percent / 100;
    const oldScale = this.stage.scaleX();

    let pos: any = {};
    if (centerPointer) {
      // zoom center on mouse pointer
      pos = this.stage.getPointerPosition();
    } else {
      // zoom center of the stage
      pos = {
        x: this.stage.width() / 2,
        y: this.stage.height() / 2
      };
    }

    const mousePointTo = {
      x: pos.x / oldScale - this.stage.x() / oldScale,
      y: pos.y / oldScale - this.stage.y() / oldScale
    };

    let newScale = oldScale * scaleBy;

    // limit scale
    const minScale = 0.2;
    const maxScale = 10;
    newScale = Math.max(minScale, newScale);
    newScale = Math.min(maxScale, newScale);

    const newPos = {
      x: -(mousePointTo.x - pos.x / newScale) * newScale,
      y: -(mousePointTo.y - pos.y / newScale) * newScale
    };

    this.stage.position({ x: newPos.x, y: newPos.y });
    this.stage.scale({ x: newScale, y: newScale });

    console.log("zoom");
    console.log(
      `stage = ${this.stage.x()} ${this.stage.y()}, ${this.stage.width()} ${this.stage.height()}`
    );
    console.log(
      `layer = ${this.layer.x()} ${this.layer.y()}, ${this.layer.width()} ${this.layer.height()}`
    );
    console.log(
      `image = ${this.image.x()} ${this.image.y()}, ${this.image.width()} ${this.image.height()}`
    );
  }

  public adjustCanvasSize(ui: UIState) {
    console.log("ui state change left=" + ui.leftSidePanelVisible);
    console.log("ui state change right=" + ui.rightSidePanelVisible);
    const bodySize = {
      width: document.body.scrollWidth,
      height: document.body.scrollHeight
    };

    // @TODO hard-coded dimensions..
    const SideToolbarWidth = 43;
    const SidePanelWidth = 300;
    const TopNavigationBarHeight = 32;
    const ImageListPanelTopToolbarHeight = 38;

    let width = bodySize.width - SideToolbarWidth * 2;
    if (ui.leftSidePanelVisible) {
      width -= SidePanelWidth;
    }
    if (ui.rightSidePanelVisible) {
      width -= SidePanelWidth;
    }
    const height = bodySize.height - TopNavigationBarHeight - ImageListPanelTopToolbarHeight * 2;

    this.stage.position({ x: 0, y: 0 });
    this.stage.width(width);
    this.stage.height(height);
    this.stage.draw();
  }

  public setImage(img: Image) {
    if (!this.stage) return;
    this.stage.removeChildren();
    this.layer = new Konva.Layer({});
    this.annotationLayer = new Konva.Layer({});
    this.stage.add(this.layer);
    this.stage.add(this.annotationLayer);

    const draggable = this.draggable;
    const cw = this;
    const imageObj = document.createElement("img");
    imageObj.onload = () => {
      const konvaImage = new Konva.Image({
        image: imageObj,
        draggable: draggable
      });

      // add the shape to the layer
      cw.layer?.add(konvaImage);
      cw.image = konvaImage;
      cw.fitToScreen();
    };
    imageObj.src = img.imageUrl;
  }

  public fitToScreen() {
    // reset zoom
    this.stage.position({
      x: 0,
      y: 0
    });
    this.stage.scale({ x: 1, y: 1 });

    // adjust layer
    const maxWidth = this.stage.width() * 0.96;
    const maxHeight = this.stage.height() * 0.96;
    const size = this.calcFitToScreenDim(
      this.image.width(),
      this.image.height(),
      maxWidth,
      maxHeight
    );

    let x = (this.stage.width() - size[0]) / 2;
    let y = (this.stage.height() - size[1]) / 2;
    this.image.size({
      width: size[0],
      height: size[1]
    });
    this.image.position({
      x: x,
      y: y
    });

    console.log("fitToScreen");
    console.log(
      `stage = ${this.stage.x()} ${this.stage.y()}, ${this.stage.width()} ${this.stage.height()}`
    );
    console.log(
      `layer = ${this.layer.x()} ${this.layer.y()}, ${this.layer.width()} ${this.layer.height()}`
    );
    console.log(
      `image = ${this.image.x()} ${this.image.y()}, ${this.image.width()} ${this.image.height()}`
    );
  }

  public addLine(){
    let line = new Konva.Line({
      points: [50,50,250,250],
      stroke: "blue",
      strokeWidth: 4,
      draggable: true,
    });
    this.layer.add(line)

    let anchor1 = new Konva.Circle({
      x: line.points()[0],
      y: line.points()[1],
      radius: 4,
      fill: "white",
      draggable: true
    });
    this.layer.add(anchor1);

    const anchor2 = new Konva.Circle({
      x: line.points()[2],
      y: line.points()[3],
      radius: 4,
      fill: "white",
      draggable: true
    })
    this.layer.add(anchor2);

    const updateLine = () => {
      const points = [
        anchor1.x() - line.x(),
        anchor1.y() - line.y(),
        anchor2.x() - line.x(),
        anchor2.y() - line.y(),
      ]
      line.points(points);
      this.layer.batchDraw();
    }
    
    const updateAnchor = () => {
      anchor1.x(line.points()[0] + line.x());
      anchor1.y(line.points()[1] + line.y());
      anchor2.x(line.points()[2] + line.x());
      anchor2.y(line.points()[3] + line.y());
    }

    anchor1.on("dragmove", updateLine);
    anchor2.on("dragmove", updateLine);
    line.on("dragmove", updateAnchor);
  }

  public addRect(){
    let rect = new Konva.Rect({
      x: 100,
      y: 100,
      width: 100,
      height: 50,
      fill: "",
      stroke: "black",
      strokeWidth: 3,
      draggable: true,
      name: "rect"
    })
    this.layer.add(rect);

    var tr = new Konva.Transformer();
    this.layer.add(tr);
    tr.nodes([rect])

    var selectionRectangle = new Konva.Rect({
        fill: "rgba(0,0,255,0.5)",
        visible: false,
      });
    this.layer.add(selectionRectangle);

    var x1, y1, x2, y2;

    this.stage.on("mousedown touchstart", (e) => {
      // do nothing if we mousedown on any shape
      if (e.target !== this.stage) {
        return;
      }
      x1 = this?.stage?.getPointerPosition()?.x;
      y1 = this?.stage?.getPointerPosition()?.y;
      x2 = this?.stage?.getPointerPosition()?.x;
      y2 = this?.stage?.getPointerPosition()?.y;

      selectionRectangle.visible(true);
      selectionRectangle.width(0);
      selectionRectangle.height(0);
    });

    this.stage.on("mousemove touchmove", () => {
      if (!selectionRectangle.visible()) {
        return;
      }
      x2 = this?.stage?.getPointerPosition()?.x;
      y2 = this?.stage?.getPointerPosition()?.y;

      selectionRectangle.setAttrs({
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      });
    });

    this.stage.on("mouseup touchend", () => {
      if (!selectionRectangle.visible()) {
        return;
      }
      // x2,y2
      setTimeout(() => {
        selectionRectangle.visible(false);
      });

      var shapes = this?.stage.find(".rect");
      var box = selectionRectangle.getClientRect();
      var selected = shapes?.filter((shape) =>
        Konva.Util.haveIntersection(box, shape.getClientRect())
      );
      tr.nodes(selected || []);
    });

    this.stage.on("click tap", function (e) {
      if (selectionRectangle.visible()) {
        return;
      }

      if (e.target === this.getStage()) {
        tr.nodes([]);
        return;
      }

      if (!e.target.hasName("rect")) {
        return;
      }

      const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
      const isSelected = tr.nodes().indexOf(e.target) >= 0;

      if (!metaPressed && !isSelected) {
        tr.nodes([e.target]);
      } else if (metaPressed && isSelected) {
        const nodes = tr.nodes().slice();
        nodes.splice(nodes.indexOf(e.target), 1);
        tr.nodes(nodes);
      } else if (metaPressed && !isSelected) {
        const nodes = tr.nodes().concat([e.target]);
        tr.nodes(nodes);
      }
    });
  }

  public addCircle() {
    let circle = new Konva.Circle({
      x: 100,
      y: 100,
      width: 100,
      height: 50,
      fill: "",
      stroke: "black",
      strokeWidth: 3,
      draggable: true,
      name: "circles"
    })
    this.layer.add(circle);

    var tr = new Konva.Transformer();
    this.layer.add(tr);
    tr.nodes([circle]);

    var selectionRectangle = new Konva.Rect({
        fill: "rgba(0,0,255,0.5)",
        visible: false,
      });
    this.layer.add(selectionRectangle);

    var x1, y1, x2, y2;

    this.stage.on("mousedown touchstart", (e) => {
      // do nothing if we mousedown on any shape
      if (e.target !== this.stage) {
        return;
      }
      x1 = this?.stage?.getPointerPosition()?.x;
      y1 = this?.stage?.getPointerPosition()?.y;
      x2 = this?.stage?.getPointerPosition()?.x;
      y2 = this?.stage?.getPointerPosition()?.y;

      selectionRectangle.visible(true);
      selectionRectangle.width(0);
      selectionRectangle.height(0);
    });

    this.stage.on("mousemove touchmove", () => {
      if (!selectionRectangle.visible()) {
        return;
      }
      x2 = this?.stage?.getPointerPosition()?.x;
      y2 = this?.stage?.getPointerPosition()?.y;

      selectionRectangle.setAttrs({
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
      });
    });

    this.stage.on("mouseup touchend", () => {
      if (!selectionRectangle.visible()) {
        return;
      }
      // x2,y2
      setTimeout(() => {
        selectionRectangle.visible(false);
      });

      var shapes = this?.stage.find(".rect");
      var box = selectionRectangle.getClientRect();
      var selected = shapes?.filter((shape) =>
        Konva.Util.haveIntersection(box, shape.getClientRect())
      );
      tr.nodes(selected || []);
    });

    this.stage.on("click tap", function (e) {
      if (selectionRectangle.visible()) {
        return;
      }

      if (e.target === this.getStage()) {
        tr.nodes([]);
        return;
      }

      if (!e.target.hasName("rect")) {
        return;
      }

      const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
      const isSelected = tr.nodes().indexOf(e.target) >= 0;

      if (!metaPressed && !isSelected) {
        tr.nodes([e.target]);
      } else if (metaPressed && isSelected) {
        const nodes = tr.nodes().slice();
        nodes.splice(nodes.indexOf(e.target), 1);
        tr.nodes(nodes);
      } else if (metaPressed && !isSelected) {
        const nodes = tr.nodes().concat([e.target]);
        tr.nodes(nodes);
      }
    });
  }

  private calcFitToScreenDim(wi, hi, ws, hs) {
    let rs = ws / hs;
    let ri = wi / hi;
    return rs > ri ? [(wi * hs) / hi, hs] : [ws, (hi * ws) / wi];
  }

  private addWheelListener() {
    const cw = this;
    // this.stage.on("wheel", e => {
    //   e.evt.preventDefault();
    //   const percent = 10;
    //   const zoomPercent = e.evt.deltaY > 0 ? +percent : -percent;
    //   cw.zoom(zoomPercent, true);
    // });
  }

  private addMouseTracker() {
    const cw = this;
    this.stage.on("mouseover", () => {
      console.log("mouseover");
    });
    this.stage.on("mouseout", () => {
      console.log("mouseout");
    });
    this.stage.on("mousemove", () => {
      const pos = cw.stage.getPointerPosition();
      if (!pos) return;
      const ee = this.el;
      if (ee) {
        ee.innerHTML = pos.x + " " + pos.y;
      }

      if (cw.isPositionOnImage(pos)) {
        console.log("position on image", pos.x, pos.y);
      } else {
        console.log("position out of image", pos.x, pos.y);
      }
    });
  }

  private addAnnotationEventListeners() {
    this.stage.on("click", e => {
      e.evt.preventDefault();
      const pointer = this.stage.getPointerPosition();
      if (!pointer) {
        return;
      }
      const scale = this.stage.scaleX();

      if (!this.isPositionOnImage(pointer)) {
        console.log("click outside of image");
        return;
      }

      const p = this.getPositionRelativeToImage(pointer);

      console.log("click on image ", p.x, p.y);
      const ee = document.querySelector(".image-editor-toolbar.bottom");
      if (ee) {
        ee.innerHTML = p.x + " " + p.y;
      }
      var circle = new Konva.Circle({
        x: pointer.x,
        y: pointer.y,
        radius: 10,
        fill: "red"
      });
    });
  }

  private getPositionRelativeToImage(pos: Vector2d): Vector2d {
    const scale = this.stage.scaleX();
    const o = this.stage.position();
    const ip = this.image.position();

    const p = {
      x: pos.x / scale - o.x - ip.x,
      y: pos.y / scale - o.y - ip.y
    };

    return p;
  }

  private isPositionOnImage(pos: Vector2d): boolean {
    const p = this.getPositionRelativeToImage(pos);
    const is = this.image.size();
    return 0 < p.x && p.x < is.width && 0 < p.y && p.y < is.height;
  }

  private toggleDrawing() {
    this.isDrawing = !this.isDrawing;
  }
}
</script>

<style lang="scss">
.image-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-content: stretch;
  .image-editor-toolbar {
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-content: stretch;
    background: $black;
    height: 2.375rem;
  }
  .image-editor-toolbar.top {
    border-bottom: 1px solid $gray-800;
  }
  .image-editor-toolbar.bottom {
    border-top: 1px solid $gray-800;
  }
  .image-editor-content {
    flex: 1 1 auto;
    cursor: pointer;
  }
}
</style>
