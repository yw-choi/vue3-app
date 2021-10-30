<template>
  <a class="image-editor-tool-button btn btn-sm rounded-0">
    <i :class="icon"></i>
  </a>
</template>

<script>
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  props: {
    icon: {
      type: String,
      default: ""
    }
  }
});
</script>

<style lang="scss">
.image-editor-tool-button {
  font-size: 1rem;
  background: $black;
  height: 2.375rem;
  border-right: 1px solid $gray-800;
  border-bottom: 1px solid $gray-800;
  margin-right: 1px;
}
.image-editor-tool-button:first-child {
  border-left: 1px solid $gray-800;
}
.image-editor-tool-button:hover {
  background: darken($primary, 20%);
}
.image-editor-tool-button:focus {
  outline: 0;
}
</style>
