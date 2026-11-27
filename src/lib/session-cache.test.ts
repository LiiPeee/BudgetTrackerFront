import { ApiError, getErrorMessage, postVoid } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import { clearAuth } from "@/lib/token-store";

describe("sessão e erros da API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("apaga o cache da conta ao encerrar a sessão", () => {
    queryClient.setQueryData(["transactions", "summary"], { expenseMonthTotal: 1234 });

    clearAuth();

    expect(queryClient.getQueryData(["transactions", "summary"])).toBeUndefined();
  });

  it("mantém a mensagem específica em vez do texto genérico da tela", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: { message: "budget already exists for this category and month", code: "bad_request" } }), { status: 400 })),
    );

    const error = await postVoid("/BudgetLimit/Create", {}, { auth: false }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(getErrorMessage(error, "genérico")).toBe("Já existe um orçamento para essa categoria nesse mês.");
  });
});
