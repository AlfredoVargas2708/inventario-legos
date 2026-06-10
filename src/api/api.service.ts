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

export const getInventario = async (column: string, value: string): Promise<any> => {
  const response = await axios.get(`${environment.apiUrl}/inventory/${column}/${value}`);
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
