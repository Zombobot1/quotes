/**
 * Converts a value to a stable JSON string where object keys are sorted
 * to ensure consistent output regardless of original key ordering.
 *
 * @param value - The value to stringify
 * @param space - Number of spaces for indentation or string to use as indent
 * @returns A stable JSON string representation
 */
export function stableStringify(
  value: unknown,
  space?: number | string
): string {
  // Handle primitive types directly
  if (value === null || value === undefined) {
    return JSON.stringify(value);
  }

  if (typeof value !== "object") {
    return JSON.stringify(value);
  }

  // Handle arrays
  if (Array.isArray(value)) {
    const items = value.map((item) => stableStringify(item));
    return `[${items.join(",")}]`;
  }

  // Handle objects
  const sortedKeys = Object.keys(value).sort();
  const items = sortedKeys.map((key) => {
    const keyStr = JSON.stringify(key);
    const valStr = stableStringify((value as Record<string, unknown>)[key]);
    return `${keyStr}:${valStr}`;
  });

  // Format with indentation if specified
  if (space !== undefined) {
    const indent = typeof space === "number" ? " ".repeat(space) : space;
    const itemStr = items.join(`,\n${indent}`);
    return `{\n${indent}${itemStr}\n}`;
  }

  return `{${items.join(",")}}`;
}
