export const normalizeTrimSpace = <T>(value: T): T => {
  if (typeof value === "string") {
    return value.replace(/\s+/g, " ").trim() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeTrimSpace(item)) as T;
  }

  if (value && typeof value === "object") {
    const normalizedObject: Record<string, unknown> = {};

    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      normalizedObject[key] = normalizeTrimSpace(item);
    });

    return normalizedObject as T;
  }

  
  return value;
};
