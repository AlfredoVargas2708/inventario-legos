type ExternalIds = Record<string, string[]>;

export function getValueByColumn<T>(
  column: string,
  row: T,
  legoGetter: (row: T) => unknown,
  piezaGetter: (row: T) => unknown,
) {
  return column === "lego" ? legoGetter(row) : piezaGetter(row);
}

export function getExternalIdEntries(externalIds: unknown) {
  if (!externalIds || typeof externalIds !== "object") return [];

  return Object.entries(externalIds as ExternalIds)
    .filter(([, ids]) => Array.isArray(ids) && ids.length > 0)
    .map(([platform, ids]) => ({ platform, ids: ids.join(", ") }));
}

export function yesNoSeverity(value: string | null | undefined) {
  return value === "Si" ? "success" : "secondary";
}
