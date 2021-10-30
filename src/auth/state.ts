import { User } from "@/auth/models/user";
import { login } from "@/auth/api";
import { useRouter } from "vue-router";
import { inject, InjectionKey, provide, reactive, Ref, ref } from "vue";

export class AuthState {
  user: Ref<User> = ref<User>(new User());

  setUser(user: User) {
    this.user.value = user;
    this.user.value.saveToLocalStorage();
  }

  clearUser() {
    this.user.value = new User();
    User.removeFromLocalStorage();
  }
}

const key: InjectionKey<AuthState> = Symbol();

export function createAuthState(): AuthState {
  const state = new AuthState();
  state.user.value = User.buildFromLocalStorage();
  provide<AuthState>(key, state);
  return state;
}

export function useAuthState(): AuthState {
  const state = inject<AuthState>(key);
  if (!state) {
    throw new Error("auth state is undefined");
  }
  return state;
}
