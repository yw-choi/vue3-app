<template>
  <div class="annotation-list accordion-item">
    <h2 class="accordion-header">
      <button
        class="accordion-button"
        :class="active ? '' : 'collapsed'"
        type="button"
        data-bs-toggle="collapse"
        :data-bs-target="'.' + listClass"
        @click="onAnnotationTypeClick()"
      >
        <i class="annotation-type-icon bi" :class="icon"></i>
        {{ title }}
      </button>
    </h2>
    <div
      :class="listClass"
      class="accordion-collapse collapse"
      data-bs-parent=".annotation-list-container"
    >
      <div class="accordion-body annotation-list-items">
        <annotation-list-item v-for="a in annotations" v-bind:key="a.id" :data="a" />
        <p v-if="annotations.length == 0">No annotation of this type</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from "vue";
import { Annotation, ANNOTATIONS_TYPE } from "../models/annotation";
import { useImageState } from "../state";
import AnnotationListItem from "./AnnotationListItem.vue";
export default defineComponent({
  components: { AnnotationListItem },
  props: {
    type: String,
    title: String,
    icon: String,
    annotations: Array
  },
  setup(props) {
    const { type } = toRefs(props);
    const state = useImageState();
    const activeAnnotationType = state.activeAnnotationType;
    const active = computed(() => {
      return activeAnnotationType.value == type.value;
    });

    const listClass = computed(() => {
      let c = "annotation-list-" + type.value;
      if (active.value) {
        c += " show";
      }
      return c;
    });

    const onAnnotationTypeClick = () => {
      if (active.value) {
        activeAnnotationType.value = ANNOTATIONS_TYPE.NONE;
      } else {
        activeAnnotationType.value = type.value ?? ANNOTATIONS_TYPE.NONE;
      }
      console.log("active annotation type ", activeAnnotationType.value);
    };

    return {
      listClass,
      active,
      onAnnotationTypeClick
    };
  }
});
</script>

<style lang="scss">
.annotation-type-icon {
  margin-right: 0.5rem;
}
.annotation-list {
  .annotation-list-items {
    padding: 0;
    p {
      padding: 1rem 1.25rem;
    }
  }
}
</style>
