/** Filtros al buscar por set (lego): la tabla muestra piezas del set. */
export const LEGO_PEDIDOS_FILTER_OPTIONS = [
  { label: "Código", value: "pieza" },
  { label: "Cantidad", value: "cantidad" },
  { label: "Bolsa", value: "task" },
  { label: "Pedido", value: "esta_pedido" },
  { label: "Reemplazado", value: "esta_reemplazado" },
  { label: "Completo", value: "esta_completo" },
  { label: "Comentarios", value: "comentarios" },
] as const;

/** Filtros al buscar por pieza: la tabla muestra sets que la contienen. */
export const PIEZA_PEDIDOS_FILTER_OPTIONS = [
  { label: "Código", value: "lego" },
  { label: "Nombre", value: "set_nombre" },
  { label: "Cantidad", value: "cantidad" },
  { label: "Bolsa", value: "task" },
  { label: "Pedido", value: "esta_pedido" },
  { label: "Reemplazado", value: "esta_reemplazado" },
  { label: "Completo", value: "esta_completo" },
  { label: "Comentarios", value: "comentarios" },
] as const;

export const SI_NO_FILTER_OPTIONS = [
  { label: "Sí", value: "Si" },
  { label: "No", value: "No" },
] as const;

export const BOOLEAN_PEDIDOS_FILTER_FIELDS = new Set([
  "esta_pedido",
  "esta_completo",
]);
