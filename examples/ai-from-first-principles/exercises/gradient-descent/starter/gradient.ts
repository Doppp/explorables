export function update(parameter: number, learningRate: number): number {
  const gradient = 2 * (parameter - 3);
  return parameter + learningRate * gradient; // Intentional sign bug.
}
