const ENUM_FIELD_NAMES = ["status"];

// Transform filter object into Prisma where clause
export function filterObjectToPrismaWhere(filter: any) {
  const where = {};

  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      if (!ENUM_FIELD_NAMES.includes(key) && typeof value === "string") {
        // Use contains for partial matching on strings (case-insensitive)
        where[key] = {
          contains: value,
          mode: "insensitive",
        };
      } else {
        // Exact match for non-string types or field that is enum
        where[key] = value;
      }
    }
  }

  return where;
}
