/**
 * Acesso a localStorage com escopo por conta.
 *
 * Preferências (tour, CDI, valores ocultos) são chaveadas com o accountId do JWT:
 * duas contas no mesmo navegador não vazam preferências entre si.
 * Sem token (tela de login), cai no escopo global — inofensivo, pois essas
 * preferências só são lidas em telas autenticadas.
 */
import { getCurrentAccountId } from "@/lib/session";

function scopedKey(key: string): string {
  const accountId = getCurrentAccountId();
  return accountId == null ? key : `${key}:${accountId}`;
}

export function getScopedItem(key: string): string | null {
  return localStorage.getItem(scopedKey(key));
}

export function setScopedItem(key: string, value: string): void {
  localStorage.setItem(scopedKey(key), value);
}

export function removeScopedItem(key: string): void {
  localStorage.removeItem(scopedKey(key));
}
