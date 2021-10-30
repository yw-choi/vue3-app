<template>
  <div class="image-list-panel">
    <div class="statusbar">
      <div class="list-info align-middle">{{ images.length ? images.length : 0 }} images</div>
      <a href="#" class="add-image-btn btn btn-sm btn-success rounded-0">
        <i class="bi bi-plus-lg"></i>
        Add Images
      </a>
    </div>

    <div class="image-list-container">
      <div class="image-list">
        <image-list-item
          v-for="image in images"
          v-bind:key="image.id"
          :image="image"
          :active="activeImage.id == image.id"
          @click="onImageListItemClick(image)"
          @deleteItem="onDeleteItem(image)"
        />
        <div class="empty-view" v-if="images.length == 0">
          <div class="empty-text">
            <i class="bi bi-box"></i>
            No images
          </div>
        </div>
      </div>

      <div class="overlay dropzone-view" v-if="status == PANEL_STATUS.DROPZONE">
        <div class="wrapper">
          <i class="bi bi-cloud-arrow-up"></i>
          <p>
            {{ $t("drop-files-here-or-click-to-upload") }}
          </p>
        </div>
      </div>
      <div class="overlay loading-view" v-else-if="status == PANEL_STATUS.LOADING">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div class="overlay error-view text-danger" v-else-if="status == PANEL_STATUS.ERROR">
        <i class="bi bi-exclamation-triangle-fill"></i>
        {{ $t("cannot-load-images") }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "@vue/runtime-core";
import ImageListItem from "@/image/components/ImageListItem.vue";
import { Dropzone } from "dropzone";
import { ref, watch } from "vue";
import { useImageState } from "../state";
import { Image } from "../models/image";
import { API_BASE_URL, getHeader } from "@/common/api.config";
import { deleteImage, fetchImages } from "@/image/api";

enum PANEL_STATUS {
  NORMAL,
  DROPZONE,
  LOADING,
  ERROR
}

export default defineComponent({
  components: {
    ImageListItem
  },
  setup() {
    const state = useImageState();
    const status = ref(PANEL_STATUS.LOADING);

    const setupDropzone = () => {
      Dropzone.autoDiscover = false;
      try {
        const dz = Dropzone.forElement(document.body);
        dz.destroy();
      } catch (e) {}

      const dz = new Dropzone(document.body, {
        url: API_BASE_URL + "/image/upload",
        method: "post",
        headers: getHeader(),
        maxFilesize: 256,
        maxFiles: null,
        paramName: "file",
        createImageThumbnails: false,
        clickable: [".add-image-btn"],
        acceptedFiles: "image/png,image/jpeg,image/bmp,image/tiff",
        previewTemplate: "<div></div>"
      });
      dz.on("addedfile", (file, progress) => {
        status.value = PANEL_STATUS.LOADING;
      });

      dz.on("queuecomplete", async () => {
        try {
          const images = await fetchImages();
          state.images.value = images;
          status.value = PANEL_STATUS.NORMAL;
        } catch (e) {
          console.log(e);
          status.value = PANEL_STATUS.ERROR;
        }
      });

      let dzDragCounter = 0;
      dz.on("dragenter", e => {
        dzDragCounter += 1;
        if (dz.getUploadingFiles() == 0) {
          status.value = PANEL_STATUS.DROPZONE;
        }
      });
      dz.on("dragleave", e => {
        dzDragCounter -= 1;
        if (dzDragCounter == 0) {
          status.value = PANEL_STATUS.NORMAL;
        }
      });
      dz.on("drop", e => {
        console.log("dz drop");
        if (dz.getQueuedFiles() == 0) {
          status.value = PANEL_STATUS.NORMAL;
        }
      });
    };
    onMounted(setupDropzone);

    const onImageListItemClick = (i: Image) => {
      state.activeImage.value = i;
    };

    const images = state.images;
    const activeImage = state.activeImage;
    watch(images, () => {
      status.value = PANEL_STATUS.NORMAL;
    });

    const onDeleteItem = async (img: Image) => {
      status.value = PANEL_STATUS.LOADING;
      try {
        await deleteImage(img);
        state.images.value = state.images.value.filter(v => v.id !== img.id);
        if (state.activeImage.value.id == img.id) {
          state.activeImage.value = new Image();
        }
      } catch (e) {
        console.error(e);
      }
    };

    return {
      PANEL_STATUS,
      images,
      activeImage,
      status,
      onImageListItemClick,
      onDeleteItem
    };
  }
});
</script>

<style scoped lang="scss">
.image-list-panel {
  height: 100%;
  width: 300px;
  background: $black;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;

  .statusbar {
    flex: 0 0 auto;
    border-bottom: 1px solid $gray-800;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: space-between;
    height: 2.375rem;
    padding-left: 0.75rem;
    .list-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }

  .image-list-container {
    overflow-y: scroll;
    flex: 1 1 auto;
    position: relative;
  }

  .image-list {
    height: 100%;
  }

  .empty-view {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .empty-text {
      font-size: 1.5rem;
    }
  }

  .overlay {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    background: rgba(0, 0, 0, 0.5);
  }

  .loading-view .spinner {
    width: 4rem;
    height: 4rem;
  }

  .error-view {
    i {
      font-size: 2rem;
      margin-right: 5px;
    }
  }

  .dropzone-view {
    cursor: pointer;
    padding: 5px;
    .wrapper {
      pointer-events: none;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      border: 2px dashed $gray-500;
      i {
        font-size: 4rem;
      }
      p {
        font-size: 1.1rem;
      }
    }
  }
  .dropzone-view:hover,
  .dropzone-view.dz-drag-hover {
    background: rgba(0, 0, 0, 0.8);
  }
}
</style>
