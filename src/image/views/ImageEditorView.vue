<template>
  <div class="image-editor-view">
    <div class="top-navigation-bar-wrapper">
      <top-navigation-bar />
    </div>
    <div class="content-wrapper">
      <div class="left-sidebar-wrapper">
        <left-sidebar />
      </div>
      <div class="image-editor-wrapper">
        <image-editor />
      </div>
      <div class="right-sidebar-wrapper">
        <right-sidebar />
      </div>
    </div>

    <!-- Modal -->

    <div class="add-label-modal modal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add Label</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>Modal body text goes here.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { fetchAnnotations, fetchImages, fetchLabels } from "@/image/api";
import ImageEditor from "@/image/components/ImageEditor/ImageEditor.vue";
import LeftSidebar from "@/image/components/LeftSidebar.vue";
import RightSidebar from "@/image/components/RightSidebar.vue";
import TopNavigationBar from "@/image/components/TopNavigationBar.vue";
import { Image } from "@/image/models/image";
import { createImageState } from "@/image/state";
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  components: { TopNavigationBar, LeftSidebar, RightSidebar, ImageEditor },
  setup() {
    const state = createImageState();
    const activeImage = state.activeImage;
    const images = state.images;
    const labels = state.labels;
    const annotations = state.annotations;

    // prefetch necessary data
    const fetchData = async () => {
      try {
        const results = await Promise.all([fetchImages(), fetchLabels()]);
        images.value = results[0];
        labels.value = results[1];
        if (!activeImage.value.id && images.value.length > 0) {
          activeImage.value = images.value[0];
        }
      } catch (e) {
        console.log("ImageEditorView: fetch failed", e);
      }
    };
    fetchData();

    watch(activeImage, async newVal => {
      if (!activeImage.value.id) {
        return;
      }
      try {
        annotations.value = await fetchAnnotations(activeImage.value);
      } catch (e) {
        console.log("ImageEditorView: fetchAnnotations failed", e);
      }
    });

    return {
      state,
      activeImage
    };
  }
});
</script>

<style lang="scss">
$TopNavigationBarHeight: 2rem;
html,
body {
  margin: 0;
  height: 100%;
  overflow: hidden;
}
.image-editor-view {
  height: 100%;
  overflow: hidden;
  max-width: 100vw;
  display: flex;
  flex-direction: column;

  .top-navigation-bar-wrapper {
    height: $TopNavigationBarHeight;
  }

  .content-wrapper {
    height: calc(100% - #{$TopNavigationBarHeight});
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .left-sidebar-wrapper {
      flex: 0 0 auto;
    }
    .image-editor-wrapper {
      flex: 1 0 auto;
    }
    .right-sidebar-wrapper {
      flex: 0 0 auto;
    }
  }
  .overlay {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    z-index: 10;
  }
}
</style>
