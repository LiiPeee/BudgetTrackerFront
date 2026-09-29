import { toCsv } from "@/helper/csv";
import { formatDateOnly } from "@/helper/date";
import type { TransactionResponse } from "@/helper/transaction";
import { TRANSACTION_TYPE } from "@/helper/transaction";

export const TRANSACTION_CSV_HEADERS = ["Data", "Nome", "Descrição", "Categoria", "Tipo", "Valor", "Contato", "Recorrência", "Pago", "Parcelas"];

function formatType(typeTransaction: number): string {
  if (typeTransaction === TRANSACTION_TYPE.EXPENSE) return "Despesa";
  if (typeTransaction === TRANSACTION_TYPE.INCOME) return "Receita";
  return "-";
}

function formatDate(transaction: TransactionResponse): string {
  return formatDateOnly(transaction.competenceDate ?? transaction.createdDate);
}

function formatAmount(amount: number): string {
  return (Number(amount) || 0).toFixed(2).replace(".", ",");
}

export function transactionToCsvRow(transaction: TransactionResponse): string[] {
  return [
    formatDate(transaction),
    transaction.name ?? "",
    transaction.description ?? "",
    transaction.category?.name ?? "",
    formatType(transaction.typeTransaction),
    formatAmount(transaction.amount),
    transaction.contact?.name ?? "",
    String(transaction.recurrence ?? ""),
    transaction.paid ? "Sim" : "Não",
    transaction.quantityOfInstallment ?? "",
  ];
}

export function buildTransactionsCsv(transactions: TransactionResponse[]): string {
  return toCsv(TRANSACTION_CSV_HEADERS, transactions.map(transactionToCsvRow));
}
