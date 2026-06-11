import { createRouter, createWebHistory } from "vue-router";
import SearchLayout from "@/layouts/SearchLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: SearchLayout,
      children: [
        { path: "", redirect: { name: "pedidos" } },
        {
          path: "pedidos",
          name: "pedidos",
          component: () => import("@/views/PedidosView.vue"),
        },
        {
          path: "inventario",
          name: "inventario",
          component: () => import("@/views/InventarioView.vue"),
        },
      ],
    },
  ],
});

export default router;
