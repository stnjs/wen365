import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
    meta: { title: "HODLTracker - Crypto Tax Tracking" },
  },
  /*   {
    path: "/",
    name: "Home",
    component: () => import("@/views/Test.vue"),
    meta: { title: "HODLTracker - Crypto Tax Tracking" },
  }, */
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/views/Dashboard.vue"),
    meta: { title: "Dashboard - HODLTracker", requiresAuth: true },
  },
  {
    path: "/portfolio",
    name: "Portfolio",
    component: () => import("@/views/Portfolio.vue"),
    meta: { title: "Portfolio - HODLTracker", requiresAuth: true },
  },
  {
    path: "/tax-free",
    name: "TaxFree",
    component: () => import("@/views/TaxFree.vue"),
    meta: { title: "Tax-Free Assets - HODLTracker", requiresAuth: true },
  },
  {
    path: "/export",
    name: "Export",
    component: () => import("@/views/Export.vue"),
    meta: { title: "Export Data - HODLTracker", requiresAuth: true },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/views/Settings.vue"),
    meta: { title: "Settings - HODLTracker", requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
    meta: { title: "404 - HODLTracker" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  // Update document title
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  // Check authentication for protected routes
  if (to.meta.requiresAuth) {
    // TODO: Implement authentication check
    // For now, allow all routes
    next();
  } else {
    next();
  }
});

export default router;
