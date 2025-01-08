export function removeUndefinedFields(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined),
  );
}

export function isEnumValue<T>(enumObj: T, value: string): boolean {
  return Object.values(enumObj).includes(value as T[keyof T]);
}

export function enumValuesToString<T>(enumObj: T) {
  return Object.values(enumObj).join(", ");
}
