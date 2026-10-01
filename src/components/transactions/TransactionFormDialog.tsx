import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormSelectField } from "@/components/ui/form-select-field";
import { FormTextField } from "@/components/ui/form-text-field";
import { LoadingButton } from "@/components/ui/loading-button";
import { toCategoryKey } from "@/helper/category";
import type { Contact } from "@/helper/contact";
import { type TransactionForm, transactionFormSchema } from "@/helper/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

type TransactionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrepareNew: () => void;
  onSubmit: (data: TransactionForm) => Promise<void> | void;
  contacts: Contact[];
  editingTransaction: boolean;
  defaultValues: TransactionForm;
  categoryOptions: readonly string[];
};

export function TransactionFormDialog({
  open,
  onOpenChange,
  onPrepareNew,
  onSubmit,
  contacts,
  editingTransaction,
  defaultValues,
  categoryOptions,
}: TransactionFormDialogProps) {
  const { t } = useTranslation("transactions");
  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues,
  });
  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (open) form.reset(defaultValues);
  }, [open, defaultValues, form]);

  const handleOpenChange = (next: boolean) => {
    if (isSubmitting) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2" onClick={onPrepareNew}>
          <Plus className="w-4 h-4" />
          {t("newTransaction")}
        </Button>
      </DialogTrigger>

      <DialogContent className="border-glass bg-card/90 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>{editingTransaction ? t("editTransaction") : t("newTransaction")}</DialogTitle>
          <DialogDescription>
            {editingTransaction ? t("editDescription") : t("newDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormTextField control={form.control} name="transactionName" label={t("fieldName")} placeholder={t("fieldNamePlaceholder")} />
            {!editingTransaction && (
              <FormTextField control={form.control} name="description" label={t("fieldDescription")} placeholder={t("fieldDescriptionPlaceholder")} />
            )}

            <FormSelectField
              control={form.control}
              name="paid"
              label={t("fieldPaid")}
              placeholder={t("select")}
              options={[
                { value: "Sim", label: t("yes") },
                { value: "Não", label: t("no") },
              ]}
            />

            <FormSelectField
              control={form.control}
              name="contactName"
              label={t("fieldContact")}
              placeholder={t("select")}
              options={contacts.map((contact) => ({ value: contact.name ?? "", label: contact.name ?? "" }))}
            />

            <FormTextField control={form.control} name="numberOfInstallment" label={t("fieldInstallments")} placeholder={t("fieldInstallmentsPlaceholder")} />
            {!editingTransaction && (
              <FormTextField control={form.control} name="dateOfInstallment" label={t("fieldInstallmentDate")} placeholder={t("fieldInstallmentDatePlaceholder")} />
            )}

            <FormSelectField
              control={form.control}
              name="recurrence"
              label={t("fieldRecurrence")}
              placeholder={t("selectShort")}
              options={[
                { value: "NONE", label: t("recurrenceNone") },
                { value: "DAILY", label: t("recurrenceDaily") },
                { value: "BIWEEKLY", label: t("recurrenceBiweekly") },
                { value: "MONTHLY", label: t("recurrenceMonthly") },
                { value: "OCCASIONALLY", label: t("recurrenceOccasionally") },
              ]}
            />

            <FormTextField control={form.control} name="amount" label={t("fieldAmount")} type="number" step="0.01" placeholder={t("fieldAmountPlaceholder")} />

            <FormSelectField
              control={form.control}
              name="type"
              label={t("fieldType")}
              placeholder={t("select")}
              options={[
                { value: "Income", label: t("typeIncome") },
                { value: "Expense", label: t("typeExpense") },
              ]}
            />

            <FormSelectField
              control={form.control}
              name="category"
              label={t("fieldCategory")}
              placeholder={t("fieldCategoryPlaceholder")}
              options={categoryOptions.map((category) => ({ value: category, label: t(`categories.${toCategoryKey(category)}`) }))}
            />

            <FormTextField control={form.control} name="subCategory" label={t("fieldSubCategory")} placeholder={t("fieldSubCategoryPlaceholder")} />

            <LoadingButton type="submit" className="w-full" isLoading={isSubmitting} loadingText={t("saving")}>
              {editingTransaction ? t("update") : t("create")}
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
