import Vue from "vue";
import Router from "vue-router";

import layout from "../layout";

Vue.use(Router);

//const isLoggedIn = true;
import * as auth from "../services/AuthService";

export default new Router({
  linkExactActiveClass: "active",
  scrollBehavior: () => ({ y: 0 }),
  mode: "history",
  hashbang: false,
  routes: [
    {
      path: "/",
      component: () => import("@/pages/samples/general-pages/landing-page"),
      name: "landing-page",
    },
    /* DASHBOARD */
    {
      path: "/dashboard",
      component: layout,
      //Protect This Route If User Not LoggedIn
      beforeEnter: (to, from, next) => {
        if (auth.isLoggedIn()) {
          next();
        } else {
          next({ name: "login" });
        }
      },
      children: [
        {
          path: "/dashboard",
          name: "dashboard",
          component: () => import("@/pages/dashboard"),
        },
      ],
    },
    /* ACCOUNT */
    {
      path: "/account",
      component: layout,
      //Protect This Route If User Not LoggedIn
      beforeEnter: (to, from, next) => {
        if (auth.isLoggedIn()) {
          next();
        } else {
          next({ name: "login" });
        }
      },
      children: [
        {
          path: "/",
          name: "account",
          component: () => import("@/pages/account/profile.vue"),
        },
        {
          path: "/account/billing",
          name: "billing",
          component: () => import("@/pages/account/billing.vue"),
        },
        {
          path: "/account/team",
          name: "team",
          component: () => import("@/pages/account/team.vue"),
        },
        {
          path: "/account/password",
          name: "password",
          component: () => import("@/pages/account/password.vue"),
        },
      ],
    },
    /* Pricing */
    {
      path: "/upgrade",
      component: layout,
      beforeEnter: (to, from, next) => {
        if (auth.isLoggedIn()) {
          next();
        } else {
          next({ name: "login" });
        }
      },
      children: [
        {
          path: "/",
          name: "upgrade",
          component: () => import("@/pages/samples/e-commerce/upgrade.vue"),
        },
      ],
    },
    {
      path: "/join-team/:token?",
      component: {
        render(c) {
          return c("router-view");
        },
      },
      children: [
        {
          path: "/",
          name: "join-team",
          component: () => import("@/pages/samples/auth-pages/join-team.vue"),
        },
      ],
    },
    {
      path: "/auth",
      component: {
        render(c) {
          return c("router-view");
        },
      },
      children: [
        {
          path: "login/:invitation?",
          name: "login",
          component: () => import("@/pages/samples/auth-pages/login"),
          beforeEnter: (to, from, next) => {
            if (auth.isLoggedIn()) {
              if (!to.params.invitation) {
                next({ name: "dashboard" });
              } else {
                next();
              }
            } else {
              next();
            }
          },
        },
        {
          path: "register/:invitation?",
          name: "register",
          component: () => import("@/pages/samples/auth-pages/register"),
          beforeEnter: (to, from, next) => {
            if (auth.isLoggedIn()) {
              if (!to.params.invitation) {
                next({ name: "dashboard" });
              } else {
                next();
              }
            } else {
              next();
            }
          },
        },
        {
          path: "forgot-password",
          name: "forgot-password",
          beforeEnter: (to, from, next) => {
            if (!auth.isLoggedIn()) {
              next();
            } else {
              next({ name: "dashboard" });
            }
          },
          component: () => import("@/pages/samples/auth-pages/forgot-password"),
        },
        {
          path: "resetpassword/:token",
          name: "reset-password",
          component: () => import("@/pages/samples/auth-pages/reset-password"),
          //Protect This Route If User Not LoggedIn
          beforeEnter: (to, from, next) => {
            if (!auth.isLoggedIn()) {
              next();
            } else {
              next({ name: "dashboard" });
            }
          },
        },
        {
          path: "emailconfirmation/:token",
          name: "emailconfirmation",
          component: () =>
            import("@/pages/samples/auth-pages/email-confirmation"),
        },
        {
          path: "invitation/:token",
          name: "invitation",
          component: () => import("@/pages/samples/auth-pages/invitation"),
        },
      ],
    },
    {
      path: "/error-pages",
      component: {
        render(c) {
          return c("router-view");
        },
      },
      children: [
        {
          path: "error-404",
          name: "error-404",
          component: () => import("@/pages/samples/error-pages/error-404"),
        },
      ],
    },
    /* ERROR PAGE */
    {
      path: "*",
      redirect: "/error-404",
      component: {
        render(c) {
          return c("router-view");
        },
      },
      children: [
        {
          path: "error-404",
          component: () => import("@/pages/samples/error-pages/error-404"),
        },
      ],
    },
  ],
});
