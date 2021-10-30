<template>
  <div class="annotation-list-item">
    <div class="annotation-type dropdown">
      <a
        class="annotation-type-btn rounded-0"
        href="#"
        data-bs-toggle="dropdown"
      >
        <i class="bi bi-caret-down-fill"></i>
        {{ currentLabel.text }}
      </a>
      <ul class="dropdown-menu">
        <li>
          <a
            class="dropdown-item"
            href="#"
            v-for="label of labels"
            :key="label.id"
            @click="onClickLabelItem(label)"
            >{{ label.text }}</a
          >
        </li>
        <li>
          <a class="dropdown-item" href="#" @click="onClickAddLabel()">
            <i class="bi bi-plus-lg"></i> Add Label
          </a>
        </li>
      </ul>
    </div>
    <div>
      <a
        href="#"
        class="annotation-delete text-info"
        @click.prevent="onClickDelete()"
        ><i class="bi bi-trash"></i
      ></a>
    </div>
    <label-modal v-if="modal" @close="modal = false">
      <Form @submit="addLabel" :validation-schema="schema">
        <div class="">
          <h3>Add Label</h3>
          <Field
            name="text"
            type="text"
            class="form-control mt-3"
            placeholder="add label here"
          />
          <ErrorMessage name="text" class="error-feedback text-danger" />
        </div>
        <footer class="mt-3 text-right">
          <slot name="footer">
            <button
              id="labelFormSubmitButton"
              class="w-25 btn btn-primary btn-lg"
              type="submit"
              :disabled="loading"
            >
              <span
                class="spinner-border"
                role="status"
                aria-hidden="true"
                v-show="loading"
              ></span>
              <span v-show="!loading">add Label</span>
            </button>
            <button
              class="w-25 btn btn-primary btn-lg margin-left"
              @click="$emit('close')"
            >
              Close
            </button>
          </slot>
        </footer>
      </Form>
    </label-modal>
  </div>
</template>

<script lang="ts">
import { Annotation, ANNOTATIONS_TYPE } from "@/image/models/annotation";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useImageState } from "@/image/state";
import { defineComponent } from "@vue/runtime-core";
import { ref, toRefs } from "vue";
import { Label } from "../models/label";
import LabelModal from "../components/LabelModal.vue";
import { useI18n } from "vue-i18n";
import { User } from "@/auth/models/user";
import { createLabel } from "../api";
import { fetchLabels } from "@/image/api";

export default defineComponent({
  components: {
    LabelModal,
    Form,
    Field,
    ErrorMessage,
  },
  props: {
    data: Annotation,
  },
  setup(props) {
    const { data } = toRefs(props);
    const state = useImageState();
    const labels = state.labels;
    const modal = ref(false);
    const loading = ref(false);
    const { t } = useI18n();
    const schema = yup.object().shape({
      text: yup.string().required(t("blank-not-allowed")),
    });

    const currentLabel = ref<Label>(new Label());
    currentLabel.value.text = "Annotation Label";
    labels.value.forEach((v) => {
      if (v.id == data.value?.labelId) {
        currentLabel.value = v;
      }
    });

    const setLabel = (l: Label) => {
      currentLabel.value = l;
      if (data.value) {
        data.value.labelId = l.id;
      }
    };

    const onClickLabelItem = (l: Label) => {
      // setLabel(l);
    };

    const onClickDelete = () => {
      if (!data.value) {
        return;
      }
      state.deleteAnnotationById(data.value.id);
    };

    const onClickAddLabel = () => {
      console.log("add label!");
      console.log(modal);
      modal.value = true;
    };

    const addLabel = async (values) => {
      const labelForm = new Label();
      const user = User.buildFromLocalStorage();
      labelForm.text = values.text;
      labelForm.userId = user.id;
      loading.value = true;
      try {
        const label = await createLabel(labelForm);
        const labels = await fetchLabels();
        state.labels.value = labels;
        modal.value = false;
        loading.value = false;
      } catch (e) {
        console.log(e);
      }
    };

    return {
      modal,
      labels,
      currentLabel,
      onClickLabelItem,
      onClickDelete,
      onClickAddLabel,
      addLabel,
    };
  },
});
</script>

<style lang="scss">
.annotation-list-item {
  padding: 0;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid $gray-800;
  padding: 1rem 1.25rem;
  .annotation-type {
    flex: 1 0 auto;
  }
  .annotation-type-btn {
    color: $white;
    text-decoration: none;
  }
  .dropdown-menu {
    width: 250px;
    a {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

.margin-left {
  margin-left: 4%;
}

.text-right {
  text-align: right;
}
</style>
