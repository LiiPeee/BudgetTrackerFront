import type { CreateBudgetLimitRequest, PagedBudgetLimitsResponse } from "@/helper/budget";
import { getJson, postVoid } from "@/lib/api";

export async function createBudgetLimit(input: CreateBudgetLimitRequest): Promise<void> {
  await postVoid("/BudgetLimit/Create", input, { fallback: "Falha ao criar orçamento" });
}

export async function getBudgetLimitsByMonthYear(month: number, year: number, pageNumber = 1): Promise<PagedBudgetLimitsResponse> {
  return getJson<PagedBudgetLimitsResponse>(
    "/BudgetLimit/GetByAccountId",
    { month, year, pageNumber },
    "Falha ao buscar orçamentos",
  );
}
