import { useMemo } from "react";

/**
 * Paginação client-side compartilhada (filtros de orçamento, lista de ações).
 * Normaliza a página atual para o intervalo válido e fatia a lista.
 */
export function useClientPagination<T>(items: T[], page: number, pageSize = 10) {
  return useMemo(() => {
    const totalRecords = items.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      currentPage,
      pageSize,
      totalRecords,
      totalPages,
    };
  }, [items, page, pageSize]);
}
