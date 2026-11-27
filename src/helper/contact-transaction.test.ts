import { mapContactToForm } from "@/helper/contact";
import { mapTransactionResponseToForm, newTransactionFormSchema, transactionFormDefaults, type TransactionResponse } from "@/helper/transaction";

describe("formulários de edição", () => {
  it("preenche tipo e endereço do contato com o que a API devolve", () => {
    const form = mapContactToForm({ id: 1, name: "Mercado", typeContactId: 2, street: "Rua A", city: "SP" });

    expect(form).toMatchObject({ typeContact: "2", street: "Rua A", city: "SP" });
  });

  it("reconhece a categoria gravada sem acento", () => {
    const form = mapTransactionResponseToForm({ id: 1, category: { name: "ALIMENTACAO" } } as TransactionResponse);

    expect(form.category).toBe("Alimentação");
  });

  it("exige subcategoria e um dia de parcela válido", () => {
    const result = newTransactionFormSchema.safeParse({
      ...transactionFormDefaults,
      transactionName: "x", contactName: "y", category: "Lazer", paid: "Sim", amount: "10", dateOfInstallment: "32",
    });

    expect(result.error?.issues.map((issue) => issue.path[0]).sort()).toEqual(["dateOfInstallment", "subCategory"]);
  });
});
