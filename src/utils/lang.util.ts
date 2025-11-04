export function normalizeBcp47Case(tag: string): string {
  if (!tag) return tag;
  const parts = tag.split('-');
  if (parts.length === 0) return tag;

  return parts
    .map((part, index) => {
      const p = part.trim();
      if (p.length === 0) return p;

      if (index === 0) {
        return p.toLowerCase();
      }

      if ((p.length === 2 && /^[A-Za-z]{2}$/.test(p)) || (p.length === 3 && /^[0-9]{3}$/.test(p))) {
        return p.toUpperCase();
      }

      if (p.length === 4 && /^[A-Za-z]{4}$/.test(p)) {
        return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
      }

      return p.toLowerCase();
    })
    .join('-');
}
