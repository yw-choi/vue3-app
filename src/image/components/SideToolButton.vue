<template>
  <a href="#" class="btn rounded-0 side-tool-button">
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
.side-tool-button {
  font-size: 1rem;
  background: $black;
  border-bottom: 1px solid $gray-800;
}
.side-tool-button:hover {
  background: darken($primary, 20%);
}
.side-tool-button:focus {
  outline: 0;
}
</style>
