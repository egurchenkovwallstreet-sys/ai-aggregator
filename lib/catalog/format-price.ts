/** Отображение цены в рублях (SPEC: цена видна до генерации). */
export function formatPriceRub(priceRub: number): string {
  return (
    new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: priceRub % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 1,
    }).format(priceRub) + " ₽"
  );
}
