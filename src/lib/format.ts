export function formatUSD(value: number) {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPropertyType(t: string) {
  const map: Record<string, string> = {
    apartamento: "Apartamento",
    casa: "Casa",
    local: "Local",
    edificio: "Edificio",
    habitacion: "Habitación",
  };
  return map[t] ?? t;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
