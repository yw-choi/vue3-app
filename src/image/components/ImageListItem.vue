<template>
  <div class="image-list-item" :class="(active ? 'active' : '') + ' img-' + image.id" ref="root">
    <div class="thumbnail"></div>
    <div class="image-description-container">
      <div class="d-flex justify-content-between">
        <p class="image-title">{{ image.originalName }}</p>
        <a href="#" class="annotation-delete text-light" @click.prevent="this.$emit('deleteItem')"
          ><i class="bi bi-trash"></i
        ></a>
      </div>
      <p class="image-info">
        {{ image.formatCreatedAt() }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Image } from "@/image/models/image";
import { defineComponent, getCurrentInstance, onMounted, toRef, watch } from "@vue/runtime-core";
import { reactive, ref, toRefs } from "vue";

export default defineComponent({
  emits: ["deleteItem"],

  props: {
    image: {
      type: Image,
      default: new Image()
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const root = ref<HTMLDivElement>();
    const { image, active } = toRefs(props);
    watch(active, newVal => {
      if (newVal) {
        root.value?.classList.add("active");
      } else {
        root.value?.classList.remove("active");
      }
    });

    onMounted(() => {
      const compEl = document.querySelector<HTMLElement>(`.image-list-item.img-${image.value.id}`);
      const thumbnailEl = compEl?.querySelector<HTMLElement>(".thumbnail");
      if (thumbnailEl) {
        thumbnailEl.style.background = "no-repeat center url(" + image.value.thumbnailUrl + ")";
        thumbnailEl.style.backgroundSize = "80px";
      }
    });
  }
});
</script>

<style lang="scss">
.image-list-item {
  height: 100px;
  background: black;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  border-bottom: 1px solid $gray-800;
}
.image-list-item:hover,
.thumbnail:hover {
  cursor: pointer;
  background: darken($primary, 20%);
}
.image-list-item.active {
  background: $info;
  .image-title,
  .image-info {
    color: white;
  }
}
.thumbnail {
  height: 100px;
  width: 100px;
  border-bottom: 1px solid $gray-800;
}
.image-description-container {
  width: 200px;
  padding: 1rem;
  .image-title,
  .image-info {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .image-title {
    color: white;
    font-size: 1rem;
  }
  .image-info {
    color: $light;
    font-size: 0.8rem;
  }
}
</style>
