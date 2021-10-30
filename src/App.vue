<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { useI18n } from "vue-i18n";
import { createAuthState } from "@/auth/state";
export default defineComponent({
  setup() {
    const { t } = useI18n();

    // inject app-wide state
    const state = createAuthState();

    document.title = t("app.title");

    return {
      state
    };
  }
});
</script>

<style lang="scss">
html,
body,
#app {
  height: 100%;
}
</style>
