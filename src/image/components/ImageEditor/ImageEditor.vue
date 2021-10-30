<template>
  <div class="image-editor">
    <div class="image-editor-toolbar top">
      <!-- <div class="btn-group"> -->
      <!-- <image-editor-tool-button icon="bi bi-zoom-in" @click.prevent="zoom(+10)" />
        <image-editor-tool-button icon="bi bi-zoom-out" @click.prevent="zoom(-10)" /> -->
      <!-- <image-editor-tool-button icon="bi bi-aspect-ratio" @click.prevent="fitToScreen()" /> -->
      <!-- <image-editor-tool-button
          icon="bi bi-arrows-move"
          @click.prevent="canvas.toggleDraggable()"
        /> -->
      <!-- </div> -->
      <div class="last-saved" v-if="image.id">Last Updated At: {{ image.formatUpdatedAt() }}</div>
      <div class="btn-group" v-if="image.id">
        <a href="#" class="save-btn btn btn-dark rounded-0" @click="saveAnnotations()"
          ><i class="bi bi-upload"></i> Save</a
        >
      </div>
    </div>
    <div class="image-editor-container"></div>
    <div class="image-editor-toolbar bottom">
      {{ image.originalName }}
    </div>
  </div>
</template>

<script lang="ts">
import { watch, onMounted, onUnmounted, defineComponent } from "vue";
import { useImageState } from "../../state";
import ResizeObserver from "resize-observer-polyfill";
import { ImageEditorController } from "@/image/components/ImageEditor/ImageEditorController";
import { pushAnnotations } from "@/image/api";

export default defineComponent({
  setup(props) {
    const state = useImageState();
    const image = state.activeImage;

    // konva stage wrapper
    let controller: ImageEditorController | undefined = undefined;

    onMounted(() => {
      controller = new ImageEditorController(state, ".image-editor-container");
      const el = controller.getStage().container();
      const ro = new ResizeObserver((entries, observer) => {
        const entry = entries[0];
        const { left, top, width, height } = entry.contentRect;
        const SIDEBAR_WIDTH = 344; // hard-coded for now
        const w = width - 2 * SIDEBAR_WIDTH;
        el.style.width = w + "px";
        console.log("document.body resized: width = ", width);
        controller?.fitToScreen();
      });

      ro.observe(document.body);
    });
    onUnmounted(() => controller?.destoryStage());

    // toolbar actions
    const zoom = (percent: number) => controller?.zoom(percent);
    const fitToScreen = () => controller?.fitToScreen();

    const saveAnnotations = async () => {
      document.querySelector<HTMLElement>(".save-btn")?.classList.add("disabled");

      try {
        image.value = await pushAnnotations(image.value, state.annotations.value);
      } catch (e) {
        console.error(e);
      } finally {
        document.querySelector<HTMLElement>(".save-btn")?.classList.remove("disabled");
      }
    };

    return {
      saveAnnotations,
      // zoom,
      fitToScreen,
      image
    };
  }
});
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
    justify-content: flex-end;
    align-content: stretch;
    background: $black;
    height: 2.375rem;
  }
  .image-editor-toolbar.top {
    border-bottom: 1px solid $gray-800;
  }
  .image-editor-toolbar.bottom {
    border-top: 1px solid $gray-800;
    justify-content: center;
  }

  .image-editor-container {
    flex: 1 1 auto;
    overflow: scroll;
  }

  .last-saved {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-right: 1rem;
  }
}
</style>
