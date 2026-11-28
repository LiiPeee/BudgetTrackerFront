import { forgotPasswordSchema, loginSchema, newPasswordSchema, signUpSchema, verificationCodeSchema } from "@/helper/auth";
import { budgetFormDefaults, budgetFormSchema } from "@/helper/budget";
import { contactFormDefaults, contactFormSchema } from "@/helper/contact";
import { stockFormDefaults, stockFormSchema } from "@/helper/stock";
import { newTransactionFormSchema, transactionFormDefaults, transactionFormSchema } from "@/helper/transaction";

// Registra o que cada formulário recusa e com qual mensagem: é o contrato com a tela.
type Parsed = { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } };

const errors = (result: Parsed): Record<string, string> =>
  Object.fromEntries(
    // A primeira mensagem de cada campo é a que o formulário mostra.
    [...(result.error?.issues ?? [])].reverse().map((issue) => [issue.path.join("."), issue.message.replace("validation:", "")]),
  );

describe("validações dos formulários", () => {
  it("login e recuperação de senha", () => {
    expect(errors(loginSchema.safeParse({ email: "x", password: "" }))).toEqual({ email: "emailInvalid", password: "passwordRequired" });
    expect(errors(forgotPasswordSchema.safeParse({ email: "a@" }))).toEqual({ email: "emailInvalid" });
    expect(loginSchema.safeParse({ email: "nome.sobrenome+x@exemplo.com.br", password: "1" }).success).toBe(true);
  });

  it("cadastro e nova senha", () => {
    expect(errors(signUpSchema.safeParse({ firstName: "  ", lastName: "", email: "x", password: "abc" }))).toEqual({
      firstName: "nameRequired",
      lastName: "lastNameRequired",
      email: "emailInvalid",
      password: "passwordStrength",
    });
    expect(errors(newPasswordSchema.safeParse({ password: "Senha-forte-1", confirmPassword: "outra" }))).toEqual({
      confirmPassword: "passwordsMismatch",
    });
    expect(errors(verificationCodeSchema.safeParse({ code: "12a" }))).toEqual({ code: "codeSixDigits" });
  });

  it("contato", () => {
    expect(errors(contactFormSchema.safeParse(contactFormDefaults))).toEqual({
      name: "nameRequired",
      email: "emailFieldRequired",
      phone: "phoneRequired",
      document: "documentRequired",
      typeContact: "contactTypeRequired",
      street: "streetRequired",
      city: "cityRequired",
      state: "stateRequired",
      zipCode: "zipRequired",
      country: "countryRequired",
    });
  });

  it("transação", () => {
    expect(errors(transactionFormSchema.safeParse(transactionFormDefaults))).toEqual({
      transactionName: "transactionNameRequired",
      subCategory: "subCategoryRequired",
      paid: "paymentStatusRequired",
      contactName: "contactRequired",
      amount: "amountInvalid",
      category: "categoryRequired",
    });

    const filled = { ...transactionFormDefaults, transactionName: "x", subCategory: "y", paid: "Sim", contactName: "z", amount: "10", category: "Lazer" };
    expect(transactionFormSchema.safeParse(filled).success).toBe(true);
    expect(errors(newTransactionFormSchema.safeParse({ ...filled, numberOfInstallment: "421", description: "d".repeat(31) }))).toEqual({
      numberOfInstallment: "installmentsInvalid",
      description: "descriptionMax",
    });
    // Os espaços das pontas saem antes de gravar.
    expect(transactionFormSchema.parse({ ...filled, transactionName: "  x  " }).transactionName).toBe("x");
  });

  it("orçamento e ativo", () => {
    expect(errors(budgetFormSchema.safeParse({ ...budgetFormDefaults, month: "13", year: "1999" }))).toEqual({
      categoryName: "categoryRequired",
      month: "monthInvalid",
      year: "yearInvalid",
      limitAmount: "limitPositive",
    });
    expect(errors(stockFormSchema.safeParse({ ...stockFormDefaults, cdiRate: "501" }))).toEqual({
      ticker: "tickerRequired",
      title: "nameRequired",
      price: "priceInvalid",
      quantity: "quantityInvalid",
      cdiRate: "cdiRateInvalid",
    });
  });
});
