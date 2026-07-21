export function double(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError("value must be finite");
  return value * 2;
}
