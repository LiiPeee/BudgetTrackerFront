import { TransactionFormDialog } from "@/components/transactions/TransactionFormDialog";
import { transactionFormDefaults } from "@/helper/transaction";
import { fireEvent, render, screen } from "@testing-library/react";

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

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

// O Intl separa "R$" do número com um espaço especial.
const total = () => screen.queryByRole("status")?.textContent?.replace(/\s/g, " ") ?? null;

describe("total do parcelamento no formulário", () => {
  it("trata o valor digitado como o de cada parcela e mostra o total", async () => {
    renderForm();

    type("Número de Parcelas", "12");
    type("Valor da parcela", "100");

    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(total()).toBe("Total: 12 parcelas de R$ 100,00 = R$ 1.200,00");
  });

  it("soma centavos sem erro de arredondamento", () => {
    renderForm();

    type("Número de Parcelas", "3");
    type("Valor da parcela", "0.1");

    expect(total()).toBe("Total: 3 parcelas de R$ 0,10 = R$ 0,30");
  });

  it.each([
    ["sem parcelas", "", "100"],
    ["uma parcela", "1", "100"],
    ["quantidade quebrada", "2.5", "100"],
    ["acima do limite", "421", "100"],
    ["sem valor", "12", ""],
  ])("não mostra total: %s", (_case, installments, amount) => {
    renderForm();

    type("Número de Parcelas", installments);
    fireEvent.change(screen.getByLabelText(/^Valor/), { target: { value: amount } });

    expect(total()).toBeNull();
  });

  it("na edição o campo continua sendo o valor do lançamento", () => {
    renderForm(true);

    expect(screen.getByLabelText("Valor")).toBeInTheDocument();
    expect(total()).toBeNull();
  });
});
