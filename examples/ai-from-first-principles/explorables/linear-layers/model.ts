export type Vector = number[];
export type Matrix = number[][];

function assertFinite(values: number[], name: string): void {
  if (values.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${name} must contain only finite numbers`);
  }
}

export function matrixShape(matrix: Matrix): [rows: number, columns: number] {
  if (matrix.length === 0) throw new RangeError("matrix must have at least one row");
  const columns = matrix[0]?.length ?? 0;
  if (columns === 0) throw new RangeError("matrix rows must not be empty");
  if (matrix.some((row) => row.length !== columns)) {
    throw new RangeError("matrix rows must have equal length");
  }
  matrix.forEach((row) => {
    assertFinite(row, "matrix");
  });
  return [matrix.length, columns];
}

export function dot(left: Vector, right: Vector): number {
  if (left.length !== right.length) {
    throw new RangeError(
      `dot product needs equal lengths; received ${left.length} and ${right.length}`,
    );
  }
  assertFinite(left, "left vector");
  assertFinite(right, "right vector");
  return left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0);
}

export function transpose(matrix: Matrix): Matrix {
  const [rows, columns] = matrixShape(matrix);
  return Array.from({ length: columns }, (_, column) =>
    Array.from({ length: rows }, (_, row) => matrix[row]?.[column] ?? 0),
  );
}

export function linearLayer(input: Vector, weights: Matrix, bias: Vector): Vector {
  const [outputs, inputs] = matrixShape(weights);
  assertFinite(input, "input");
  assertFinite(bias, "bias");
  if (input.length !== inputs) {
    throw new RangeError(
      `input length ${input.length} does not match weight columns ${inputs}`,
    );
  }
  if (bias.length !== outputs) {
    throw new RangeError(
      `bias length ${bias.length} does not match weight rows ${outputs}`,
    );
  }
  return weights.map((row, index) => dot(row, input) + (bias[index] ?? 0));
}

export function dotTerms(
  input: Vector,
  weightRow: Vector,
  bias: number,
): { products: number[]; total: number } {
  const products = weightRow.map(
    (weight, index) => weight * (input[index] ?? Number.NaN),
  );
  return {
    products,
    total: dot(input, weightRow) + bias,
  };
}
