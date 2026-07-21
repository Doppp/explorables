export function differentiate(x: number, w: number, b: number) {
  const z = x * w + b;
  const dz = 2 * z;
  return { y: z ** 2, dx: dz * w, dw: dz * x, db: dz };
}
