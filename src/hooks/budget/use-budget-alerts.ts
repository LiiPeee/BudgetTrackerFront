import { QUERY_STALE_TIME } from "@/constants/query";
import { type BudgetLimit } from "@/helper/budget";
import { getBudgetLimitsByMonthYear } from "@/services/budget";
import { useQuery } from "@tanstack/react-query";

export const BUDGET_ALERTS_QUERY_KEY = ["budgetAlerts"] as const;

/**
 * Busca apenas os orçamentos do mês/ano informado no backend — o Dashboard
 * não precisa (e não deve) baixar todo o histórico para contar alertas.
 */
export function useBudgetAlerts(month: number, year: number) {
  return useQuery({
    queryKey: [...BUDGET_ALERTS_QUERY_KEY, month, year],
    queryFn: async () => {
      const page = await getBudgetLimitsByMonthYear(month, year, 1);
      return (page.items ?? []) as BudgetLimit[];
    },
    staleTime: QUERY_STALE_TIME,
  });
}
