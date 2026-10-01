import { QUERY_STALE_TIME } from "@/constants/query";
import { calcFixedIncomeChangePercentage, type StockResponse } from "@/helper/stock";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { fetchAllPages } from "@/lib/paginate";
import { getAllFunds, getAllStocks } from "@/services/stock";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const PAGE_SIZE = 10;

async function fetchAllAssets(): Promise<StockResponse[]> {
  const [stocks, funds] = await Promise.all([fetchAllPages((page) => getAllStocks(page)), fetchAllPages((page) => getAllFunds(page))]);
  return [...stocks, ...funds];
}

export function useStocksList(page: number, cdiAnnualRate: number, today: Date) {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["stocks", "list-all"],
    queryFn: fetchAllAssets,
    staleTime: QUERY_STALE_TIME,
  });

  const allAssets = useMemo(
    () => (data ?? []).map((stock) => ({ ...stock, percentage: calcFixedIncomeChangePercentage(stock, cdiAnnualRate, today) ?? stock.percentage })),
    [data, cdiAnnualRate, today],
  );
  const { items: stocks, currentPage, pageSize, totalRecords, totalPages } = useClientPagination(allAssets, page, PAGE_SIZE);

  return {
    stocks,
    currentPage,
    pageSize: PAGE_SIZE,
    totalRecords,
    totalPages,
    isLoading,
    isRefreshing: isFetching,
    refetch,
  };
}
