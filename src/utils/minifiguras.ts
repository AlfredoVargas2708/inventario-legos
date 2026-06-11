import type { Minifigura } from "@/api/api.service";

type MinifigurasBlock = {
  total?: number;
  results?: Minifigura[];
};

export function getPedidoMinifiguras(row: { rebrickData?: unknown }): Minifigura[] {
  const data = row.rebrickData as { minifiguras?: MinifigurasBlock } | undefined;
  return data?.minifiguras?.results ?? [];
}

export function getPedidoMinifigCount(row: { rebrickData?: unknown }): number {
  const data = row.rebrickData as { minifiguras?: MinifigurasBlock } | undefined;
  return data?.minifiguras?.total ?? 0;
}

export function getPedidoMinifigLabel(row: {
  lego?: string;
  rebrickData?: unknown;
}): string {
  const data = row.rebrickData as { name?: string } | undefined;
  return String(data?.name ?? row.lego ?? "");
}
