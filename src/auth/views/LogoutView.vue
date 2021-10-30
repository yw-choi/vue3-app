<template>
  <div></div>
</template>

<script lang="ts">
import { useAuthState } from "@/auth/state";
import { defineComponent } from "@vue/runtime-core";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const state = useAuthState();
    const router = useRouter();
    state.clearUser();
    router.push("/");
  }
});
</script>

<style></style>
