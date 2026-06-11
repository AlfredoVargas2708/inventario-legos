import { environment } from "@/environments/environment";
import axios from "axios";

export interface PedidoPayload {
  lego: string;
  pieza: string;
  cantidad: string;
  task: string;
  esta_pedido: string;
  esta_completo: string;
  esta_reemplazado?: string | null;
  comentarios?: string | null;
  set_nombre?: string;
}

export type PedidoUpdatePayload = Omit<PedidoPayload, "set_nombre">;

export interface PedidoRow {
  id: string;
  lego: string;
  pieza: string;
  cantidad: string;
  task: string;
  esta_pedido: string;
  esta_completo: string;
  esta_reemplazado: string | null;
  comentarios: string | null;
  set_nombre?: string;
  rebrickData?: unknown;
}

export interface InstructionManual {
  numero: number;
  total: number;
  url: string;
  etiqueta: string;
}

export interface InstructionBooklet {
  url: string;
  idioma: string;
  etiqueta: string;
}

export interface Instrucciones {
  manuales: InstructionManual[];
  folleto?: InstructionBooklet;
}

export interface Minifigura {
  id: number;
  set_num: string;
  set_name: string;
  quantity: number;
  set_img_url: string;
}

export interface MinifigurasResponse {
  total: number;
  results: Minifigura[];
}

export interface LegoColor {
  id: number;
  name: string;
  rgb: string;
  is_trans: boolean;
  name_translated?: string;
}

export interface ColorsResponse {
  total: number;
  results: LegoColor[];
}

export const getColors = async (
  lang = "es",
  signal?: AbortSignal,
): Promise<ColorsResponse> => {
  const response = await axios.get(`${environment.apiUrl}/colors`, {
    params: { lang },
    signal,
  });
  return response.data;
};

export interface LegoTheme {
  id: number;
  name: string;
  parent_id: number | null;
}

export interface ThemesResponse {
  total: number;
  results: LegoTheme[];
}

export const getThemes = async (signal?: AbortSignal): Promise<ThemesResponse> => {
  const response = await axios.get(`${environment.apiUrl}/themes`, { signal });
  return response.data;
};

export const searchValue = async (
  column: string,
  value: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
) => {
  const response = await axios.get(
    `${environment.apiUrl}/search/${column}/${encodeURIComponent(value)}?page=${page}&limit=${pageSize}`,
    { signal },
  );
  return response.data;
};

export const searchExistValue = async (
  column: string,
  value: string,
  signal?: AbortSignal,
): Promise<any> => {
  const response = await axios.get<any>(
    `${environment.apiUrl}/element-exist/${column}/${encodeURIComponent(value)}`,
    { signal },
  );
  return response.data;
};

export type InventoryFilters = Record<string, string>;

export interface InventorySort {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const getInventario = async (
  column: string,
  value: string,
  page: number,
  pageSize: number,
  filters: InventoryFilters = {},
  sort?: InventorySort | null,
  signal?: AbortSignal,
): Promise<any> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(pageSize),
  });

  for (const [key, filterValue] of Object.entries(filters)) {
    const trimmed = filterValue.trim();
    if (trimmed) params.set(key, trimmed);
  }

  if (sort?.sortBy) {
    params.set("sortBy", sort.sortBy);
    params.set("sortOrder", sort.sortOrder);
  }

  const response = await axios.get(
    `${environment.apiUrl}/inventory/${column}/${encodeURIComponent(value)}?${params.toString()}`,
    { signal },
  );
  return response.data;
};

export const createPedido = async (data: PedidoPayload) => {
  const response = await axios.put(`${environment.apiUrl}/`, data);
  return response.data;
};

export const updatePedido = async (id: string, data: PedidoUpdatePayload) => {
  const response = await axios.put(`${environment.apiUrl}/editar/${id}`, data);
  return response.data;
};

export const deletePedido = async (id: string) => {
  const response = await axios.delete(`${environment.apiUrl}/${id}`);
  return response.data;
};
