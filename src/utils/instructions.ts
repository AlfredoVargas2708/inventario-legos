import type { Instrucciones } from "@/api/api.service";

export function hasInstrucciones(data: Instrucciones | null | undefined): boolean {
  if (!data) return false;
  return data.manuales.length > 0 || Boolean(data.folleto);
}

export function getPedidoInstrucciones(row: {
  rebrickData?: unknown;
}): Instrucciones | undefined {
  const data = row.rebrickData as { instrucciones?: Instrucciones } | undefined;
  return data?.instrucciones;
}

export function getInventoryInstrucciones(
  row: Record<string, unknown>,
): Instrucciones | undefined {
  return row.instrucciones as Instrucciones | undefined;
}
