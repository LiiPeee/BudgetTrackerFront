import { TransactionFormDialog } from "@/components/transactions/TransactionFormDialog";
import { mapTransactionFormToEditRequest, mapTransactionFormToRequest, transactionFormDefaults, type TransactionForm } from "@/helper/transaction";
import { fireEvent, render, screen } from "@testing-library/react";

const filled: TransactionForm = { ...transactionFormDefaults, transactionName: "TV", amount: "100", numberOfInstallment: "3" };

function renderForm(editingTransaction = false) {
  render(
    <TransactionFormDialog
      open
      onOpenChange={vi.fn()}
      onPrepareNew={vi.fn()}
      onSubmit={vi.fn()}
      contacts={[]}
      editingTransaction={editingTransaction}
      defaultValues={transactionFormDefaults}
      categoryOptions={["Moradia"]}
    />,
  );
}

const type = (value: string) => fireEvent.change(screen.getByLabelText("Número de Parcelas"), { target: { value } });
const field = () => screen.queryByRole("combobox", { name: "Primeira parcela" });

describe("mês da primeira parcela", () => {
  afterEach(() => vi.useRealTimers());

  it("só pergunta quando há parcelamento, começando no próximo mês", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 11, 15));
    renderForm();
    expect(field()).not.toBeInTheDocument();

    type("1");

    expect(field()).toHaveTextContent("No próximo mês (janeiro)");
  });

  it("permite escolher o mês atual", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 28));
    renderForm();
    type("3");

    fireEvent.click(field()!);
    fireEvent.click(screen.getByRole("option", { name: "Neste mês (novembro)" }));

    expect(field()).toHaveTextContent("Neste mês (novembro)");
  });

  it("não aparece na edição", () => {
    renderForm(true);

    expect(field()).not.toBeInTheDocument();
  });

  it("envia a escolha para a API somente na criação", () => {
    expect(mapTransactionFormToRequest(filled).firstInstallmentInCurrentMonth).toBe(false);
    expect(mapTransactionFormToRequest({ ...filled, firstInstallment: "current" }).firstInstallmentInCurrentMonth).toBe(true);
    expect(mapTransactionFormToRequest({ ...filled, numberOfInstallment: "", firstInstallment: "current" }).firstInstallmentInCurrentMonth).toBe(false);
    expect(mapTransactionFormToEditRequest(filled)).not.toHaveProperty("firstInstallmentInCurrentMonth");
  });
});
