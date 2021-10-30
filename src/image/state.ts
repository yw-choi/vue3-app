import { inject, InjectionKey, provide, ref, Ref } from "vue";
import { Image } from "@/image/models/image";
import { Annotation, ANNOTATIONS_TYPE } from "@/image/models/annotation";
import { Label } from "./models/label";

export class ImageState {
  images: Ref<Image[]> = ref<Image[]>([]);
  labels: Ref<Label[]> = ref<Label[]>([]);
  activeImage: Ref<Image> = ref<Image>(new Image());
  annotations: Ref<Annotation[]> = ref<Annotation[]>([]);
  activeAnnotationType: Ref<String> = ref(ANNOTATIONS_TYPE.NONE);

  deleteAnnotationById(id: string) {
    this.annotations.value = this.annotations.value.filter(v => {
      return v.id !== id;
    });
  }
}

const key: InjectionKey<ImageState> = Symbol();

export function createImageState(): ImageState {
  const state = new ImageState();
  provide<ImageState>(key, state);
  return state;
}

export function useImageState(): ImageState {
  const state = inject<ImageState>(key);
  if (!state) {
    throw new Error("image state is undefined");
  }
  return state;
}