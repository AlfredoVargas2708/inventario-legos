export const LEGO_FILTER_OPTIONS = [
  { label: "Código", value: "element_id" },
  { label: "Nombre", value: "part.name" },
  { label: "Color", value: "color.name" },
  { label: "Cantidad", value: "quantity" },
  { label: "Nº pieza", value: "part.part_num" },
] as const;

export const PIEZA_FILTER_OPTIONS = [
  { label: "Código", value: "set_num" },
  { label: "Nombre", value: "name" },
  { label: "Piezas", value: "num_parts" },
  { label: "Tema", value: "theme.name" },
  { label: "Año", value: "year" },
] as const;

export const ROWS_PER_PAGE_OPTIONS = [3, 6, 9, 12, 15, 18, 20];

export const DATA_TABLE_PAGINATOR_TEMPLATE =
  "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport";

export const DATA_TABLE_PAGE_REPORT = "{first}–{last} de {totalRecords}";

export const COLOR_FILTER_FIELD = "color.name";
