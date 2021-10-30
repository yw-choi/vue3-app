<template>
  <div class="right-sidebar">
    <div class="right-panel-wrapper">
      <annotation-list-panel />
    </div>
    <div class="right-toolbar-wrapper">
      <div class="right-toolbar btn-toolbar">
        <div class="btn-group-vertical btn-group-md">
          <side-tool-button icon="bi-tag" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import SideToolButton from "@/image/components/SideToolButton.vue";
import AnnotationListPanel from "@/image/components/AnnotationListPanel.vue";

export default defineComponent({
  components: { SideToolButton, AnnotationListPanel },
  setup() {
    return {};
  }
});
</script>

<style lang="scss">
.right-sidebar {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-items: flex-end;

  .right-toolbar-wrapper {
    background: $black;
    border-left: 1px solid $gray-800;
    .right-toolbar {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }
  .right-panel-wrapper {
    border-left: 1px solid $gray-800;
  }
}
</style>
