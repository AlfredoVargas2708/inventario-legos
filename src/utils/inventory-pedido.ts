export function buildPedidoDefaultsFromInventory(
  column: string,
  searchValue: string,
  row: Record<string, unknown>,
  setNombre?: string,
) {
  if (column === "lego") {
    return {
      lego: searchValue.trim(),
      pieza: String(row.element_id ?? ""),
      cantidad: Number(row.quantity) || 1,
      set_nombre: setNombre ?? "",
      label: String((row.part as { name?: string })?.name ?? row.element_id ?? ""),
      image: (row.part as { part_img_url?: string })?.part_img_url ?? "",
      detail: (row.color as { name?: string })?.name ?? "",
    };
  }

  return {
    lego: String(row.set_num ?? ""),
    pieza: searchValue.trim(),
    cantidad: 1,
    set_nombre: String(row.name ?? ""),
    label: String(row.name ?? row.set_num ?? ""),
    image: String(row.set_img_url ?? ""),
    detail: row.theme ? String((row.theme as { name: string }[]).at(-1)?.name ?? "") : "",
  };
}
