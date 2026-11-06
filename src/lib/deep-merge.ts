type Dict = Record<string, unknown>;
const isDict = (v: unknown): v is Dict =>
  !!v && typeof v === "object" && !Array.isArray(v);

export function deepMerge<T extends Dict>(base: T, override: Dict): T {
  const out: Dict = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = out[key];
    out[key] =
      isDict(current) && isDict(value) ? deepMerge(current, value) : value;
  }
  return out as T;
}
