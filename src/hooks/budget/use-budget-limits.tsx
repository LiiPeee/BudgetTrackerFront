import { QUERY_STALE_TIME } from "@/constants/query";
import { BUDGET_ALERTS_QUERY_KEY } from "@/hooks/budget/use-budget-alerts";
import { type BudgetLimit, type BudgetLimitForm, mapBudgetFormToRequest } from "@/helper/budget";
import { getErrorMessage } from "@/lib/api";
import { fetchAllPages } from "@/lib/paginate";
import { createBudgetLimit, getBudgetLimitsByMonthYear } from "@/services/budget";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const BUDGET_LIMITS_QUERY_KEY = ["budgetLimits"] as const;

function fetchAllBudgetLimits(month: number, year: number): Promise<BudgetLimit[]> {
  return fetchAllPages<BudgetLimit>((page) => getBudgetLimitsByMonthYear(month, year, page));
}

export function useBudgetLimits(month: number, year: number, onCreated?: (month: number, year: number) => void) {
  const { t } = useTranslation("budgets");
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const query = useQuery({
    queryKey: [...BUDGET_LIMITS_QUERY_KEY, month, year],
    queryFn: () => fetchAllBudgetLimits(month, year),
    staleTime: QUERY_STALE_TIME,
  });

  const createMutation = useMutation({
    mutationFn: createBudgetLimit,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: BUDGET_LIMITS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: BUDGET_ALERTS_QUERY_KEY });
    },
  });

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const submitBudget = useCallback(
    async (data: BudgetLimitForm) => {
      try {
        const request = mapBudgetFormToRequest(data);
        await createMutation.mutateAsync(request);
        toast.success(t("createSuccess"));
        // Mostra o mês do orçamento criado, que pode não ser o que está na tela.
        onCreated?.(request.month, request.year);
        handleDialogClose();
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, t("createError")));
      }
    },
    [createMutation, handleDialogClose, onCreated, t],
  );

  return {
    budgets: (query.data ?? []) as BudgetLimit[],
    error: query.error ? getErrorMessage(query.error, t("loadError")) : null,
    isDialogOpen,
    isRefreshing: query.isFetching || createMutation.isPending,
    refetchBudgets: () => query.refetch(),
    handleDialogClose,
    submitBudget,
    setIsDialogOpen,
  };
}
