import { TRANSACTION_CATEGORY_OPTIONS } from "@/constants/transaction-categories";
import { type Category, toCategoryKey } from "@/helper/category";
import { Contact } from "@/helper/contact";
import { z } from "zod";

export const TRANSACTION_TYPE = { EXPENSE: 1, INCOME: 2 } as const;

export type PaidValue = "Sim" | "Não" | "";
export type TransactionType = "Income" | "Expense";
export type RecurrenceLabel = "Não" | "Diário" | "Quinzenal" | "Mensal" | "Ocasionalmente" | "-";

export interface TransactionRequest {
  transactionName: string;
  subCategory?: string;
  numberOfInstallment?: number | null;
  dateOfInstallment?: number | null;
  paid: boolean;
  contactName: string;
  recurrence: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date?: string;
}

export type EditTransactionRequest = Omit<TransactionRequest, "numberOfInstallment" | "dateOfInstallment" | "date">;

export interface TransactionForm {
  id: number;
  transactionName: string;
  subCategory: string;
  numberOfInstallment: string;
  dateOfInstallment: string;
  paid: PaidValue;
  contactName: string;
  recurrence: string;
  description: string;
  amount: string;
  type: TransactionType;
  category: string;
  date?: string;
}

export interface TransactionResponse {
  id: number;
  name?: string;
  createdDate?: string;
  competenceDate?: string;
  subCategory?: string;
  quantityOfInstallment?: string;
  dateOfInstallment?: string;
  paid?: boolean;
  contact: Contact;
  recurrence: string;
  description: string;
  amount: number;
  typeTransaction: number;
  category: Category;
  date?: string;
}
export type PagedTransactionsResponse = {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  items: TransactionResponse[];
};

// Raw backend shape before normalization: recurrence arrives as a numeric code, a label string, or null.
export type TransactionResponseRaw = Omit<TransactionResponse, "recurrence"> & { recurrence: number | string | null };
export type PagedTransactionsResponseRaw = Omit<PagedTransactionsResponse, "items"> & { items: TransactionResponseRaw[] };

export const transactionFormDefaults: TransactionForm = {
  recurrence: "NONE",
  contactName: "",
  dateOfInstallment: "",
  numberOfInstallment: "",
  paid: "",
  subCategory: "",
  transactionName: "",
  description: "",
  amount: "",
  type: "Expense",
  category: "",
  date: new Date().toISOString().split("T")[0],
  id: 0,
};

export interface InstallmentSummary {
  installments: number;
  amount: number;
  total: number;
}

/** O valor digitado é o de cada parcela. Sem parcelamento válido de duas ou mais, não há total a mostrar. */
export function getInstallmentSummary(amount: string, numberOfInstallment: string): InstallmentSummary | null {
  const installments = Number(numberOfInstallment);
  const value = Number(amount);

  if (!Number.isInteger(installments) || installments < 2 || installments > 420) return null;
  if (!(value > 0 && value <= 999999.99)) return null;

  // Em centavos, para 3 x 0,10 dar 0,30 e não 0,30000000000000004.
  return { installments, amount: value, total: (Math.round(value * 100) * installments) / 100 };
}

export function mapTransactionFormToRequest(form: TransactionForm): TransactionRequest {
  const amount = Number.parseFloat(form.amount.replace(",", "."));
  const numberOfInstallment = form.numberOfInstallment.trim() ? Number.parseInt(form.numberOfInstallment, 10) : null;
  const dateOfInstallment = form.dateOfInstallment.trim() ? Number.parseInt(form.dateOfInstallment, 10) : null;

  if (Number.isNaN(amount)) {
    throw new Error("amount inválido: o schema do formulário deveria ter bloqueado este valor");
  }

  return {
    transactionName: form.transactionName.trim(),
    description: form.description.trim(),
    category: form.category.trim(),
    subCategory: form.subCategory.trim() || undefined,
    amount,
    type: form.type,
    paid: form.paid === "Sim",
    numberOfInstallment,
    dateOfInstallment,
    recurrence: form.recurrence,
    contactName: form.contactName.trim(),
    date: form.date,
  };
}

export function mapTransactionFormToEditRequest(form: TransactionForm): EditTransactionRequest {
  // Installment data is fixed at creation; the list only has "3/12", which must not be sent back.
  const { numberOfInstallment, dateOfInstallment, date, ...editRequest } = mapTransactionFormToRequest(form);
  return editRequest;
}

const optionalIntegerBetween = (min: number, max: number, message: string) =>
  z.string().refine((value) => {
    const number = Number(value);
    return value.trim() === "" || (Number.isInteger(number) && number >= min && number <= max);
  }, message);

// Os limites repetem os do backend, para o erro aparecer no campo.
export const transactionFormSchema = z.object({
  id: z.number(),
  transactionName: z.string().trim().min(1, "validation:transactionNameRequired").max(50, "validation:transactionNameMax"),
  subCategory: z.string().trim().min(1, "validation:subCategoryRequired").max(30, "validation:subCategoryMax"),
  numberOfInstallment: z.string(),
  dateOfInstallment: z.string(),
  paid: z.enum(["", "Sim", "Não"]).refine((value) => value !== "", "validation:paymentStatusRequired"),
  contactName: z.string().trim().min(1, "validation:contactRequired"),
  recurrence: z.string().min(1, "validation:recurrenceRequired"),
  description: z.string().trim().max(30, "validation:descriptionMax"),
  amount: z.string().refine((value) => Number(value) > 0 && Number(value) <= 999999.99, "validation:amountInvalid"),
  type: z.enum(["Income", "Expense"]),
  category: z.string().trim().min(1, "validation:categoryRequired"),
  date: z.string().optional(),
});

export const newTransactionFormSchema = transactionFormSchema.extend({
  numberOfInstallment: optionalIntegerBetween(1, 420, "validation:installmentsInvalid"),
  dateOfInstallment: optionalIntegerBetween(1, 31, "validation:installmentDayInvalid"),
});

// A API devolve o nome como está no banco; o formulário usa o da lista de opções.
function toCategoryOption(name: string): string {
  return TRANSACTION_CATEGORY_OPTIONS.find((option) => toCategoryKey(option) === toCategoryKey(name)) ?? name;
}

// The list shows recurrence as a label; the form select and the API use codes.
const RECURRENCE_CODE_BY_LABEL: Record<string, string> = {
  Não: "NONE",
  Diário: "DAILY",
  Quinzenal: "BIWEEKLY",
  Mensal: "MONTHLY",
  Ocasionalmente: "OCCASIONALLY",
};

function toRecurrenceCode(value: string | null | undefined): string {
  if (value == null) return "NONE";
  if (value === "-") return "";
  return RECURRENCE_CODE_BY_LABEL[value] ?? value;
}

export function mapTransactionResponseToForm(transaction: TransactionResponse): TransactionForm {
  return {
    ...transactionFormDefaults,
    transactionName: transaction.name ?? "",
    description: transaction.description ?? "",
    category: toCategoryOption(transaction.category?.name ?? ""),
    subCategory: transaction.subCategory ?? "",
    amount: transaction.amount == null ? "" : String(transaction.amount),
    type: transaction.typeTransaction === TRANSACTION_TYPE.EXPENSE ? "Expense" : "Income",
    paid: transaction.paid === true ? "Sim" : transaction.paid === false ? "Não" : "",
    numberOfInstallment: transaction.quantityOfInstallment ?? "",
    dateOfInstallment: transaction.dateOfInstallment ?? "",
    recurrence: toRecurrenceCode(transaction.recurrence),
    contactName: transaction.contact?.name ?? "",
    date: transaction.date,
    id: transaction.id,
  };
}
