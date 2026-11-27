import { QUERY_STALE_TIME } from "@/constants/query";
import { CHART_COLORS, type CategoryChartData } from "@/hooks/transaction/category-breakdown";
import i18n from "@/i18n";
import { fetchAllPages } from "@/lib/paginate";
import { getAllFunds, getAllStocks } from "@/services/stock";
import { useQuery } from "@tanstack/react-query";

function toChartData(entries: { ticker: string; total: number }[], grandTotal: number): CategoryChartData[] {
  return entries
    .sort((a, b) => b.total - a.total)
    .map(({ ticker, total }, index) => ({
      category: ticker,
      total,
      percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
}

async function computePortfolioAllocation() {
  const [stocks, funds] = await Promise.all([
    fetchAllPages((page) => getAllStocks(page)),
    fetchAllPages((page) => getAllFunds(page)),
  ]);

  const allAssets = [...stocks, ...funds];

  const rvEntries: { ticker: string; total: number }[] = [];
  const rfEntries: { ticker: string; total: number }[] = [];

  for (const asset of allAssets) {
    const isFixedIncome = asset.isStock === false;
    // Renda fixa não tem cotação de mercado (priceMarket vem 0 do backend) — usa o preço de compra como valor atual.
    // TODO: usar calcCdiAccruedSummary (src/helper/cdi.ts) com cdiRate/investmentDate para refletir o rendimento acumulado,
    // em vez do valor de compra parado — hoje o total da carteira não cresce mesmo com o CDB rendendo.
    // Sem cotação (priceMarket 0), a posição vale o que custou, e não zero.
    const unitPrice = !isFixedIncome && asset.priceMarket > 0 ? asset.priceMarket : asset.priceBuyed;
    const entries = isFixedIncome ? rfEntries : rvEntries;
    // Várias aplicações com o mesmo código formam uma fatia só.
    const existing = entries.find((entry) => entry.ticker === asset.ticker);
    if (existing) existing.total += asset.quantity * unitPrice;
    else entries.push({ ticker: asset.ticker, total: asset.quantity * unitPrice });
  }

  const totalRV = rvEntries.reduce((sum, e) => sum + e.total, 0);
  const totalRF = rfEntries.reduce((sum, e) => sum + e.total, 0);
  const totalValue = totalRV + totalRF;

  const overview: CategoryChartData[] = totalValue > 0
    ? [
        { category: i18n.t("stocks:rendaVariavelTitle"), total: totalRV, percentage: (totalRV / totalValue) * 100, fill: CHART_COLORS[0] },
        { category: i18n.t("stocks:rendaFixaTitle"), total: totalRF, percentage: (totalRF / totalValue) * 100, fill: CHART_COLORS[4] },
      ].filter((e) => e.total > 0)
    : [];

  return {
    rendaVariavel: toChartData(rvEntries, totalRV),
    rendaFixa: toChartData(rfEntries, totalRF),
    overview,
    totalRV,
    totalRF,
    totalValue,
  };
}

export function usePortfolioAllocation() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["stocks", "portfolio-allocation"],
    queryFn: computePortfolioAllocation,
    staleTime: QUERY_STALE_TIME,
  });

  return {
    rendaVariavel: data?.rendaVariavel ?? [],
    rendaFixa: data?.rendaFixa ?? [],
    overview: data?.overview ?? [],
    totalRV: data?.totalRV ?? 0,
    totalRF: data?.totalRF ?? 0,
    totalValue: data?.totalValue ?? 0,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
