<template>
  <div class="top-navigation-bar">
    <div class="top-nav-left">
      <a class="logo" href="#"> </a>
    </div>
    <div class="top-nav-center"></div>
    <div class="top-nav-right">
      <a href="#" class="btn btn-primary btn-sm logout" @click="logout()">
        {{ $t("logout") }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { useAuthState } from "@/auth/state";
import { defineComponent } from "@vue/runtime-core";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const state = useAuthState();
    const router = useRouter();
    const logout = () => {
      state.clearUser();
      router.push("/");
    };
    return {
      logout
    };
  }
});
</script>

<style lang="scss">
.top-navigation-bar {
  height: 100%;
  background-color: darken($primary, 10);

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: stretch;

  padding-left: 3rem;

  .top-nav-left {
    flex: 0 0 auto;

    display: flex;
    align-content: stretch;
    .logo {
      display: flex;
      align-content: center;
      background: no-repeat center url("~@/assets/logo.png");
      background-size: 100px;
      width: 120px;
    }
    .logo:hover {
      cursor: pointer;
      background-color: lighten($blue, 10%);
    }
  }

  .top-nav-center {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;
  }

  .top-nav-right {
    .logout {
      height: 100%;
    }
  }
}
</style>
