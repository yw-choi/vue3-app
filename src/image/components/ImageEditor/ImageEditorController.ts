import { Annotation, ANNOTATIONS_TYPE } from "@/image/models/annotation";
import { Image } from "@/image/models/image";
import { Point } from "@/image/models/point";
import { ImageState } from "@/image/state";
import Konva from "konva";
import { shapes } from "konva/lib/Shape";
import { Vector2d } from "konva/lib/types";
import { watch } from "vue";
import { LineAnnotation } from "./LineAnnotation";
import { PolygonAnnotation } from "./PolygonAnnotation";
import { RectAnnotation } from "./RectAnnotation";

export enum ImageEditorMode {
  NORMAL,
  ANNOTATING,
  ANNOTATING_LINE,
  ANNOTATING_RECT
}
/**
 * A wrapper for Konva.Stage
 * - stateful: watches ImageState and sync image/annotation objects
 * - event delegation from Stage object to child nodes
 */
export class ImageEditorController {
  #mode: ImageEditorMode
  #stage: Konva.Stage;
  #state: ImageState;
  #stateMap: Map<string,Konva.Node>
  #activeAnnotation: Konva.Group| undefined

  private static ID_ACTIVE_ANNOTATION = "active-annotation"
  private static ID_IMAGE = "image"
  private static ID_IMAGE_LAYER = "image-layer"
  private static ID_ANNOTATION_LAYER = "annotation-layer"

  constructor(state: ImageState, container: string) {
    this.#stage = new Konva.Stage({
      container: container
    })
    this.#state = state;
    const imageLayer = new Konva.Layer({
      id: ImageEditorController.ID_IMAGE_LAYER
    })
    const annotationLayer = new Konva.Layer({
      id: ImageEditorController.ID_ANNOTATION_LAYER
    })
    this.#stage.add(imageLayer)
    this.#stage.add(annotationLayer)
    this.#stateMap = new Map<string,Konva.Node>()
    this.#mode = ImageEditorMode.NORMAL
    this.addEventListeners();

    const c = this;
    watch(this.#state.activeImage, (val) => {
      c.setImage(val)
    })
    watch(this.#state.annotations, (val)=>{
      console.log("IEC: watch annotations")
      c.setAnnotations(val)
    })

  }

  mode(m?: ImageEditorMode) {
    if (m!==undefined) {
      this.#mode = m
    }
    if (this.#mode == ImageEditorMode.NORMAL) {
      this.#activeAnnotation = undefined
    }
    return this.#mode
  }

  getState(): ImageState {
    return this.#state;
  }

  getStage(): Konva.Stage {
    return this.#stage;
  }

  setImage(img: Image) {
    const imageLayer = this.findImageLayer()
    const annotationLayer = this.findAnnotationLayer()

    if (!imageLayer || !annotationLayer) {
      throw new Error("ImageEditorController: Layers are not found")
    }

    imageLayer.destroyChildren()
    annotationLayer.destroyChildren()

    const stage = this;

    const el = document.createElement("img");
    el.onload = () => {
      const imageNode = new Konva.Image({
        image: el,
        id: ImageEditorController.ID_IMAGE
      });
      imageLayer.add(imageNode)
      stage.fitToScreen()
    };
    el.src = img.imageUrl;
  }

  setAnnotations(val: Annotation[]) {
    const annotationLayer = this.findAnnotationLayer()
    if (!annotationLayer) {
      throw new Error("ImageEditorController: Layers are not found")
    }
    annotationLayer.destroyChildren();
    this.#stateMap.clear();

    for (const a of val) {
      switch (a.type) {
        case ANNOTATIONS_TYPE.LINE:
          const l = LineAnnotation.buildFromAnnotationData(a)
          this.#stateMap.set(a.id, l)
          annotationLayer.add(l)
          break
        case ANNOTATIONS_TYPE.RECT:
          // annotationLayer.add(LineAnnotation.buildFromAnnotationData(a))
          const ll = RectAnnotation.buildFromAnnotationData(a)
          this.#stateMap.set(a.id, ll)
          annotationLayer.add(ll)
          break
        case ANNOTATIONS_TYPE.POLYGON:
          // annotationLayer.add(LineAnnotation.buildFromAnnotationData(a))
          const lll = PolygonAnnotation.buildFromAnnotationData(a)
          this.#stateMap.set(a.id, lll)
          annotationLayer.add(lll)
          break
        default:
          console.log("annotation type not implemented", a.type);
          break
      }
    }
    annotationLayer.batchDraw()
  }

  findImageNode(): Konva.Image {
    return this.#stage.findOne("#"+ImageEditorController.ID_IMAGE)
  }

  findAnnotationLayer(): Konva.Layer {
    return this.#stage.findOne("#"+ImageEditorController.ID_ANNOTATION_LAYER)
  }

  findImageLayer(): Konva.Layer {
    return this.#stage.findOne("#"+ImageEditorController.ID_IMAGE_LAYER)
  }

  fitToScreen() {
    // reset zoom
    this.#stage.position({ x: 0, y: 0, });
    this.#stage.size(this.getContainerSize())
    this.#stage.scale({ x: 1, y: 1 });

    const img = this.findImageNode();
    if (!img) {
      return
    }

    // adjust layer
    const maxWidth = this.#stage.width() * 0.96;
    const maxHeight = this.#stage.height() * 0.96;
    const size = this.calcFitToScreenDim(
      img.width(),
      img.height(),
      maxWidth,
      maxHeight
    );

    const x = (this.#stage.width() - size[0]) / 2;
    const y = (this.#stage.height() - size[1]) / 2;
    img.size({
      width: size[0],
      height: size[1]
    });
    img.position({
      x: x,
      y: y
    });
  }

  zoom(percent) {
    throw new Error("Not implemented");
  }

  destoryStage() {
    this.#stage.destroy()
  }

  private getContainerSize(): {width:number, height: number} {
    return {
      width: this.#stage.container().offsetWidth,
      height: this.#stage.container().offsetHeight
    }
  }

  private addEventListeners() {
    // konva supported events:
    // mouseover, mouseout, mouseenter, mouseleave, mousemove, mousedown, mouseup, 
    // wheel, click, dblclick, dragstart, dragmove, and dragend

    const stage = this.#stage;
    const controller = this;

    this.#stage.on("click", (e)=>{
      const pos = stage.getPointerPosition()
      if (!pos) {
        return
      }
      console.log("stage click", controller.mode())

      const shape = e.target;

      // @TODO only add logic is implemented
      switch(controller.mode()) {
        case ImageEditorMode.NORMAL:
          // start drawing a new annotation based on state.activeAnnotationType
          if (controller.getState().activeAnnotationType.value!=ANNOTATIONS_TYPE.NONE) {
            controller.startNewAnnotation(pos)
          }

          break;
        case ImageEditorMode.ANNOTATING:
          // target: anchor point
          // delegates 
          const isCompleted = controller.handleClick(shape, pos)
          if (isCompleted) {
            controller.mode(ImageEditorMode.NORMAL)
          }
          break;
        default:
          break;
      }
    })

    this.#stage.on("mousemove", (e)=>{
      const pos = stage.getPointerPosition()
      if (!pos) {
        return
      }

      const shape = e.target;
      switch(controller.mode()) {
        case ImageEditorMode.ANNOTATING:
          // delegates click action to annotation object
          controller.handleMousemove(pos)

          break;
        default:
          break;
      }
    })
  }

  private calcFitToScreenDim(wi, hi, ws, hs): [number, number] {
    const rs = ws / hs;
    const ri = wi / hi;
    return rs > ri ? [(wi * hs) / hi, hs] : [ws, (hi * ws) / wi];
  }

  private resetLayers() {
    this.findImageLayer()?.destroyChildren()
    this.findAnnotationLayer()?.destroyChildren()
  }

  startNewAnnotation(pos: Vector2d) {
    const al = this.findAnnotationLayer()
    if (!al) {
      console.log("ImageEditorController.startNewAnnotation: annotation layer not found")
      return
    }
    switch (this.getState().activeAnnotationType.value) {
      case ANNOTATIONS_TYPE.LINE:
        const g = LineAnnotation.newAnnotation(pos)
        al.add(g)
        this.#activeAnnotation = g
        break;
      case ANNOTATIONS_TYPE.RECT:
        const gg = RectAnnotation.newAnnotation(pos)
        al.add(gg)
        this.#activeAnnotation = gg
        break;
      case ANNOTATIONS_TYPE.POLYGON:
        const ggg = PolygonAnnotation.newAnnotation(pos)
        al.add(ggg)
        this.#activeAnnotation = ggg
        break;
      default:
        break;
    }
    this.mode(ImageEditorMode.ANNOTATING)
  }

  handleClick(shape, pos: Vector2d) {
    const al = this.findAnnotationLayer()
    if (!al) {
      console.error("ImageEditorController.handleClick: annotation layer not found")
      return
    }
    if (!this.#activeAnnotation) {
      console.error("ImageEditorController.handleClick: active annotation is absent")
      return
    }

    let isCompleted = false;
    switch (this.getState().activeAnnotationType.value) {
      case ANNOTATIONS_TYPE.LINE:
        const g = <LineAnnotation>this.#activeAnnotation
        isCompleted = g.handleClick(pos)
        if (isCompleted) {
          const a = new Annotation()
          a.id = (Math.random() + 1).toString(36).substring(7);
          a.imageId = this.#state.activeImage.value.id
          a.type = ANNOTATIONS_TYPE.LINE
          a.data = [
            new Point(g.anchors[0].position().x, g.anchors[0].position().y ),
            new Point(g.anchors[1].position().x, g.anchors[1].position().y )
          ]

          this.#state.annotations.value.push(a)
        }
        break;
      case ANNOTATIONS_TYPE.RECT:
        const gg = <RectAnnotation>this.#activeAnnotation
        isCompleted = gg.handleClick(pos)
        if (isCompleted) {
          const a = new Annotation()
          a.id = (Math.random() + 1).toString(36).substring(7);
          a.imageId = this.#state.activeImage.value.id
          a.type = ANNOTATIONS_TYPE.RECT
          a.data = [
            new Point(gg.anchors[0].position().x, gg.anchors[0].position().y ),
            new Point(gg.anchors[1].position().x, gg.anchors[1].position().y ),
            new Point(gg.anchors[2].position().x, gg.anchors[2].position().y ),
            new Point(gg.anchors[3].position().x, gg.anchors[3].position().y )
          ]

          this.#state.annotations.value.push(a)
        }
        break;
      case ANNOTATIONS_TYPE.POLYGON:
        const ggg = <PolygonAnnotation>this.#activeAnnotation
        isCompleted = ggg.handleClick(shape, pos)
        if (isCompleted) {
          const a = new Annotation()
          a.id = (Math.random() + 1).toString(36).substring(7);
          a.imageId = this.#state.activeImage.value.id
          a.type = ANNOTATIONS_TYPE.POLYGON
          a.data = []
          for (const ac of ggg.anchors) {
            a.data.push(new Point(ac.x(), ac.y()))
          }
          console.log("new annotation id", a.id)
          this.#state.annotations.value.push(a)
        }
      default:
        break;
    }
    return isCompleted
  }

  handleMousemove(pos: Vector2d) {
    const al = this.findAnnotationLayer()
    if (!al) {
      console.log("ImageEditorController.handleMousemove: annotation layer not found")
      return
    }
    switch (this.getState().activeAnnotationType.value) {
      case ANNOTATIONS_TYPE.LINE:
        const g = <LineAnnotation>this.#activeAnnotation
        g.handleMousemove(pos)
        break;
      case ANNOTATIONS_TYPE.RECT:
        const gg = <RectAnnotation>this.#activeAnnotation
        gg.handleMousemove(pos)
        break;
      case ANNOTATIONS_TYPE.POLYGON:
        const ggg = <PolygonAnnotation>this.#activeAnnotation
        ggg.handleMousemove(pos)
        break;
      default:
        break;
    }
  }
}

