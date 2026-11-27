import {
  TransactionForm,
  TransactionResponse,
  mapTransactionFormToEditRequest,
  mapTransactionFormToRequest,
  mapTransactionResponseToForm,
  transactionFormDefaults,
} from "@/helper/transaction";
import { BUDGET_ALERTS_QUERY_KEY } from "@/hooks/budget/use-budget-alerts";
import { BUDGET_LIMITS_QUERY_KEY } from "@/hooks/budget/use-budget-limits";
import { getErrorMessage } from "@/lib/api";
import { createTransaction, deleteTransactions, setTransactionPaid, updateTransaction } from "@/services/transaction";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useTransaction() {
  const { t } = useTranslation("transactions");
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionResponse | null>(null);

  // Stable per editing entity so the dialog only resets when the target changes, not on every keystroke.
  const transactionDefaults = useMemo<TransactionForm>(
    () => (editingTransaction ? mapTransactionResponseToForm(editingTransaction) : transactionFormDefaults),
    [editingTransaction],
  );

  const invalidateTransactionQueries = useCallback(async () => {
    await Promise.all(
      [["transactions"], BUDGET_LIMITS_QUERY_KEY, BUDGET_ALERTS_QUERY_KEY].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
  }, [queryClient]);

  const onOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setEditingTransaction(null);
  }, []);

  const submitTransaction = useCallback(
    async (data: TransactionForm) => {
      try {
        if (editingTransaction) {
          await updateTransaction(editingTransaction.id, mapTransactionFormToEditRequest(data));
          toast.success(t("updateSuccess"));
        } else {
          await createTransaction(mapTransactionFormToRequest(data));
          toast.success(t("createSuccess"));
        }
        setIsDialogOpen(false);
        setEditingTransaction(null);
        void invalidateTransactionQueries();
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, t("saveError")));
      }
    },
    [editingTransaction, invalidateTransactionQueries, t],
  );

  const handleEdit = useCallback((transaction: TransactionResponse) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteTransactions(id);
        await invalidateTransactionQueries();
        toast.success(t("deleteSuccess"));
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, t("deleteError")));
      }
    },
    [invalidateTransactionQueries, t],
  );

  const handleTogglePaid = useCallback(
    async (transaction: TransactionResponse) => {
      try {
        await setTransactionPaid(transaction.id, !transaction.paid);
        await invalidateTransactionQueries();
        toast.success(t("paidSuccess"));
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, t("paidError")));
      }
    },
    [invalidateTransactionQueries, t],
  );

  return {
    handleDelete,
    handleEdit,
    handleTogglePaid,
    submitTransaction,
    onOpenChange,
    transactionDefaults,
    isDialogOpen,
    editingTransaction: Boolean(editingTransaction),
  };
}
