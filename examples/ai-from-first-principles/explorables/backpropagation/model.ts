export interface GraphResult {
  z: number;
  y: number;
  dx: number;
  dw: number;
  db: number;
}

export function forwardBackward(x: number, w: number, b: number): GraphResult {
  const z = x * w + b;
  const dz = 2 * z;
  return { z, y: z ** 2, dx: dz * w, dw: dz * x, db: dz };
}

export function finiteDifferenceW(
  x: number,
  w: number,
  b: number,
  epsilon = 1e-5,
): number {
  const evaluate = (weight: number) => (x * weight + b) ** 2;
  return (evaluate(w + epsilon) - evaluate(w - epsilon)) / (2 * epsilon);
}
