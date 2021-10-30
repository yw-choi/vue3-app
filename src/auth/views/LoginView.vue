<template>
  <div class="container">
    <div class="form-group mx-auto" id="form-signin">
      <div class="text-center">
        <img class="mb-4" src="@/assets/logo.png" alt="" width="300" />
      </div>
      <Form @submit="doLogin" :validation-schema="schema">
        <div class="form-floating mb-3">
          <Field name="email" type="email" class="form-control" placeholder="{{ $t('email') }}" />
          <label for="email">{{ $t("email") }}</label>
          <ErrorMessage name="email" class="error-feedback text-danger" />
        </div>
        <div class="form-floating mb-3">
          <Field
            name="password"
            type="password"
            class="form-control"
            placeholder="{{ $t('password') }}"
          />
          <label for="password">{{ $t("password") }}</label>
          <ErrorMessage name="password" class="error-feedback text-danger" />
        </div>

        <div class="form-group mb-3">
          <button
            id="loginFormSubmitButton"
            class="w-100 btn btn-primary btn-lg"
            type="submit"
            :disabled="loading"
          >
            <span class="spinner-border" role="status" aria-hidden="true" v-show="loading"></span>
            <span v-show="!loading"> {{ $t("login") }} </span>
          </button>
        </div>

        <div class="form-group">
          <div v-show="message" class="alert alert-danger" role="alert">
            {{ message }}
          </div>
        </div>
      </Form>
      <p class="mt-5 mb-3 text-muted">&copy; {{ $t("loginform.copyright") }}</p>
    </div>
  </div>
</template>
<script lang="ts">
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { STATUS_CODE, ServerError } from "@/common/api.config";
import { defineComponent } from "@vue/runtime-core";
import { useAuthState } from "@/auth/state";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { User } from "@/auth/models/user";
import { login } from "@/auth/api";

export default defineComponent({
  components: {
    Form,
    Field,
    ErrorMessage
  },
  setup() {
    const state = useAuthState();
    const user = state.user;
    const router = useRouter();
    if (user.value.isLoggedIn()) {
      router.push("/");
      return;
    }
    const { t } = useI18n();
    const schema = yup.object().shape({
      email: yup
        .string()
        .required(t("email-is-required"))
        .email(t("email-is-invalid-format")),
      password: yup.string().required(t("password-is-required"))
    });

    const loading = ref(false);
    const message = ref("");

    const doLogin = async values => {
      const loginForm = new User();
      loginForm.email = values.email;
      loginForm.password = values.password;
      loading.value = true;
      try {
        const user = await login(loginForm);
        state.setUser(user);
        console.log("login success", user);
        router.push({ path: "/" });
        return;
      } catch (e) {
        loading.value = false;
        if (e instanceof ServerError) {
          switch (e.status) {
            case STATUS_CODE.AUTH_INVALID_PASSWORD:
              message.value = t("invalid-password");
              break;
            case STATUS_CODE.AUTH_USER_NOT_FOUND:
              message.value = t("email-not-found");
              break;
            default:
              message.value = t("error-occurred");
              break;
          }
        } else {
          message.value = t("error-occurred");
        }
      }
    };

    return {
      doLogin,
      schema,
      t,
      loading,
      message
    };
  }
});
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
#form-signin {
  margin-top: 200px;
  max-width: 300px;
  #loginFormSubmitButton {
    height: 54.5px;
  }
}
</style>

function loginAndSaveUser(loginForm: any) { throw new Error("Function not implemented."); }
