import i18n from "@/i18n";

// Códigos de erro estáveis expostos pelo backend (GlobalExceptionMiddleware).
// O código é usado quando a mensagem em inglês não é reconhecida.
const backendErrorCodes: Record<string, string> = {
  bad_request: "somethingWrong",
  unauthorized: "unauthorized",
  not_found: "notFound",
  conflict: "somethingWrong",
  internal: "somethingWrong",
};

const backendErrorKeys: Record<string, string> = {
  "email is invalid": "emailInvalid",
  "password is invalid": "passwordInvalid",
  "invalid credentials": "invalidCredentials",
  "temporarily locked": "accountLocked",
  "invalid or expired reset code": "invalidResetCode",
  "invalid token": "invalidResetCode",
  "account is not active": "accountInactive",
  "email is not verified": "emailNotVerified",
  "account not found": "accountNotFound",
  "invalid refresh token": "invalidRefreshToken",
  "token expiry": "tokenExpiry",
  "exceeds attempts": "exceedsAttempts",
  "account is already exist": "accountExists",
  "password must not be empty": "passwordEmpty",
  "password must be at least 8 characters": "passwordMin",
  "password must be less than 20 characters": "passwordMax",
  "password must contain at least one uppercase letter": "passwordUpper",
  "password must contain at least one lowercase letter": "passwordLower",
  "we cannot find contact or category for this transaction": "contactOrCategoryNotFound",
  "transaction not found or access denied": "transactionNotFound",
  "we cannot find transactions": "noTransactions",
  "something wrong happen": "somethingWrong",
  "contact not found or access denied": "contactNotFound",
  "contactid inválido": "contactIdInvalid",
  "contact with this name already exists": "contactExists",
  "budget already exists": "budgetExists",
  "price must be greater than zero": "priceInvalid",
  "quantity must be greater than zero": "quantityInvalid",
};

export function translateBackendError(raw: string | undefined | null, fallback: string, code?: string | null): string {
  // The message is more specific than the code: a wrong password and an expired session
  // are both "unauthorized".
  const lower = raw?.trim().toLowerCase() ?? "";

  for (const [needle, key] of Object.entries(backendErrorKeys)) {
    if (lower.includes(needle)) return i18n.t(`errors:${key}`);
  }

  if (code && backendErrorCodes[code]) return i18n.t(`errors:${backendErrorCodes[code]}`);

  return fallback;
}
