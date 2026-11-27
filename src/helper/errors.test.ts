import i18n from "@/i18n";
import { translateBackendError } from "./errors";
import { mapTransactionFormToEditRequest, mapTransactionResponseToForm, type TransactionResponse } from "./transaction";

describe("translateBackendError", () => {
  it("prefers the specific message over the generic code", () => {
    expect(translateBackendError("invalid credentials", "fallback", "unauthorized")).toBe(i18n.t("errors:invalidCredentials"));
    expect(translateBackendError("Invalid or expired reset code", "fallback", "unauthorized")).toBe(i18n.t("errors:invalidResetCode"));
  });

  it("falls back to the code, then to the given text", () => {
    expect(translateBackendError("something else", "fallback", "unauthorized")).toBe(i18n.t("errors:unauthorized"));
    expect(translateBackendError(undefined, "fallback")).toBe("fallback");
  });
});

describe("editing a transaction", () => {
  const transaction: TransactionResponse = {
    id: 1,
    name: "Aluguel",
    description: "casa",
    amount: 10,
    paid: true,
    recurrence: "Mensal",
    quantityOfInstallment: "3/12",
    typeTransaction: 1,
    contact: { id: 1, name: "A", email: "a@example.com", phone: "1" },
    category: { id: 1, name: "MORADIA" },
  };

  it("sends the description and recurrence code, never the installment label", () => {
    const request = mapTransactionFormToEditRequest(mapTransactionResponseToForm(transaction));

    expect(request.description).toBe("casa");
    expect(request.recurrence).toBe("MONTHLY");
    expect(request).not.toHaveProperty("numberOfInstallment");
  });
});
