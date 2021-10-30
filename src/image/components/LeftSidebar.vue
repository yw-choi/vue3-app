<template>
  <div class="left-sidebar">
    <div class="left-toolbar-wrapper">
      <div class="left-toolbar btn-toolbar">
        <div class="btn-group-vertical btn-group-md">
          <side-tool-button icon="bi-images" />
        </div>
      </div>
    </div>
    <div class="left-panel-wrapper">
      <image-list-panel />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import SideToolButton from "@/image/components/SideToolButton.vue";
import ImageListPanel from "@/image/components/ImageListPanel.vue";
export default defineComponent({
  components: { SideToolButton, ImageListPanel },
  setup() {
    return {};
  }
});
</script>

<style lang="scss">
.left-sidebar {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;

  .left-toolbar-wrapper {
    background: $black;
    border-right: 1px solid $gray-800;
    .left-toolbar {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }
  .left-panel-wrapper {
    border-right: 1px solid $gray-800;
  }
}
</style>
