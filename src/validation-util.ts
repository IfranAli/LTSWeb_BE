export function parseNumber(value: unknown): number {
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = parseInt(value);

    if (isNaN(parsed)) {
      throw new Error(`Invalid number: ${value}`);
    }

    return parsed;
  }

  throw new Error(`Invalid type for number: ${typeof value}`);
}

export function parseDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  throw new Error(`Invalid type for date: ${typeof value}`);
}
