import { QUERY_GC_TIME, QUERY_STALE_TIME } from "@/constants/query";
import { QueryClient } from "@tanstack/react-query";

// Fora do App para que o logout e o login possam apagar o cache: sem isso, a conta
// seguinte na mesma aba veria os dados da anterior.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME,
      gcTime: QUERY_GC_TIME,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Repeating a failed POST can create the record twice.
      retry: 0,
    },
  },
});
