import { User } from "@/auth/models/user";
import { createWebHistory, createRouter } from "vue-router";
const routes = [
  {
    path: "/",
    redirect: "/editor"
  },
  {
    path: "/login",
    component: () => import("@/auth/views/LoginView.vue")
  },
  {
    path: "/editor",
    component: () => import("@/image/views/ImageEditorView.vue")
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/common/PageNotFoundView.vue")
  },
  {
    path: "/logout",
    component: () => import("@/auth/views/LogoutView.vue")
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const publicPages = ["/login"];
  const authRequired = !publicPages.includes(to.path);
  const user = User.buildFromLocalStorage();

  if (to.path == "/login" && user.isLoggedIn()) {
    next("/");
  } else if (authRequired && !user.isLoggedIn()) {
    next("/login");
  } else {
    next();
  }
});

export default router;
