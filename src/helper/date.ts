/**
 * Formata uma data ISO (ex.: "2026-07-15T00:00:00" ou "2026-07-15") como dd/mm/aaaa.
 *
 * Parseia a parte date-only como local para evitar o off-by-one UTC→local que
 * `new Date("2026-07-15")` causa em fusos com offset negativo (ex.: GMT-3),
 * onde a meia-noite UTC "volta" um dia na exibição.
 */
export function formatDateOnly(raw: string | null | undefined): string {
  if (!raw) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
  return new Date(raw).toLocaleDateString("pt-BR");
}
