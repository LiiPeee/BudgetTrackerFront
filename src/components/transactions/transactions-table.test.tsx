import type { TransactionResponse } from "@/helper/transaction";
import { render, screen } from "@testing-library/react";
import { TransactionsTable } from "./TransactionsTable";

const baseTransaction: TransactionResponse = {
  id: 1,
  description: "Compra",
  amount: 100,
  recurrence: "Não",
  typeTransaction: 1,
  contact: { id: 9, name: "Loja", email: "loja@mail.com", phone: "11999" },
  category: { id: 6, name: "Lazer" },
};

describe("TransactionsTable date column", () => {
  it("renders the competence date when present", () => {
    // Regression guard: the date must render as-is (15/07/2026), not shifted
    // back a day by the UTC→local parsing bug (14/07/2026 in GMT-3).
    const competenceDate = "2026-07-15";
    render(<TransactionsTable transactions={[{ ...baseTransaction, competenceDate }]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("15/07/2026")).toBeInTheDocument();
  });

  it("falls back to a dash when there is no date", () => {
    render(<TransactionsTable transactions={[baseTransaction]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("-")).toBeInTheDocument();
  });
});
