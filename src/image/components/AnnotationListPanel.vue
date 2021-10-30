<template>
  <div class="annotation-list-panel">
    <div class="statusbar">
      <div class="list-info align-middle">Annotations</div>
    </div>
    <div class="annotation-list-container accordian">
      <annotation-list
        v-for="data of annotationsByType"
        v-bind:key="data.type"
        :type="data.type"
        :icon="data.icon"
        :title="data.title"
        :annotations="data.annotations"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useImageState } from "../state";
import { Annotation, ANNOTATIONS_TYPE } from "@/image/models/annotation";
import AnnotationList from "./AnnotationList.vue";

export default defineComponent({
  components: { AnnotationList },
  setup() {
    const state = useImageState();
    const annotations = state.annotations;

    const annotationsByType = computed(() => {
      return [
        {
          type: ANNOTATIONS_TYPE.LINE,
          title: "Line",
          icon: "bi-slash-lg",
          annotations: annotations.value.filter(a => a.type == ANNOTATIONS_TYPE.LINE)
        },
        {
          type: ANNOTATIONS_TYPE.RECT,
          title: "Rect",
          icon: "bi-bounding-box",
          annotations: annotations.value.filter(a => a.type == ANNOTATIONS_TYPE.RECT)
        },
        {
          type: ANNOTATIONS_TYPE.POLYGON,
          title: "Polygon",
          icon: "bi-heptagon",
          annotations: annotations.value.filter(a => a.type == ANNOTATIONS_TYPE.POLYGON)
        }
      ];
    });

    return {
      annotationsByType
    };
  }
});
</script>

<style lang="scss">
.annotation-list-panel {
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

  .annotation-list-container {
    overflow: auto;
    height: 100%;
  }
}
</style>
