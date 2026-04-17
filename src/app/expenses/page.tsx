import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, type RootState } from "@/store";
import { BookUp, CirclePlus, Trash } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { exportToExcel, formatDate } from "@/lib/utils";
import DialogForm from "@/components/form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { clearCategories, getCategories } from "@/store/category";
import { AppConstant } from "@/interfaces/app-common";
import { getUser } from "@/store/auth";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/interfaces/expense";
import { addExpense, clearExpense, deleteExpense, getExpenses, setPage } from "@/store/expense";
import { subDays, format } from "date-fns";
import type { ChartData, ChartRow } from "@/components/chart-interactive";
import { isSameDay } from "date-fns";
import ChartInteractive from "@/components/chart-interactive";
import { PaginationInteractive } from "@/components/pagination-interactive";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { clearProfile, getProfile } from "@/store/profile";
export default function Page() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const header = [t("expense.table_category"), t("expense.table_amount"), t("expense.table_date"), t("expense.table_note"), ""];
  const dispatch = useAppDispatch();
  const { data: expenseData } = useSelector((state: RootState) => state.expense);
  const { data: categories } = useSelector((state: RootState) => state.categories);
  const { data: user } = useSelector((state: RootState) => state.auth);
  const { data: profile } = useSelector((state: RootState) => state.profile);
  const [openExpenseForm, setOpenExpenseForm] = useState<boolean>(false);
  const [openNoCategoryWarning, setOpenNoCategoryWarning] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<DateRange | Date | undefined>(
    () => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return {
        from: firstDayOfMonth,
        to: now
      }
    }
  );
  const [openConfirmDeleteForm, setOpenConfirmDeleteForm] = useState<boolean>(false);
  const [expenseSelected, setExpenseSelected] = useState<Expense>(() => ({
    id: "",
    amount: 0,
    category_id: 0,
    category: null,
    user_id: null,
    expense_date: new Date().toLocaleString(),
  }));
  const [range, setRange] = useState<string>("90");
  const { page, pageSize, total } = useSelector((state: RootState) => state.expense);
  useEffect(() => {
    dispatch(getExpenses({ from: (dateFilter as DateRange)?.from?.toLocaleString(), to: (dateFilter as DateRange)?.to?.toLocaleString() }));
    return () => {
      // clear slice when leaving the page
      dispatch(clearExpense());
    }
  }, [dispatch, dateFilter]);

  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
  }, [user, dispatch]);

  useEffect(() => {
    dispatch(getProfile(user?.id || ""));
    dispatch(getCategories());
    return () => {
      dispatch(clearProfile());
      dispatch(clearCategories());
    }
  }, [dispatch]);

  const expenseCategories = useMemo(() => categories ? categories.filter(category => category.type === "Expense") : [], [categories]);

  const handleAddExpense = async () => {
    if (!expenseSelected) return;
    // const { id, category, ...payload } = expenseSelected;
    const payload = {
      amount: expenseSelected.amount,
      category_id: expenseSelected.category_id,
      user_id: expenseSelected.user_id,
      expense_date: expenseSelected.expense_date,
      description: expenseSelected.description
    };
    try {
      await dispatch(addExpense(payload)).unwrap();
      setOpenExpenseForm(false);
      setExpenseSelected({
        id: "",
        amount: 0,
        category_id: 0,
        category: null,
        user_id: user?.id || null,
        expense_date: new Date().toLocaleString(),
        description: "" // Ensure this is cleared
      });
    } catch (error) {
      console.error("Submission failed:", error);
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setExpenseSelected((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  }

  const handleDeleteExpense = async () => {
    if (!expenseSelected.id) return;
    await dispatch(deleteExpense(Number(expenseSelected.id)));
    setOpenConfirmDeleteForm(false);
    setExpenseSelected({
      id: "",
      amount: 0,
      category_id: 0,
      category: null,
      user_id: user?.id || null,
      expense_date: new Date().toLocaleString(),
      description: "" // Ensure this is cleared
    });
  }

  const sumExpense = useMemo(() => {
    return (expenseData ?? []).reduce((accumulator, item) => accumulator + (item.amount || 0), 0);
  }, [expenseData])

  const processChartData = (days: number) => {
    const data = [] as ChartRow[];
    const now = new Date();

    if (!expenseData || !expenseCategories)
      return { data: [], chartConfig: {}, title: t("expense.title"), description: t("expense.chart_description_1") } as ChartData<ChartRow>;

    // create base structure (one entry per date)
    for (let i = days; i >= 0; i--) {
      const date = subDays(now, i);

      const entry: ChartRow = {
        date: format(date, "MMM dd"),
      };

      // fill each category into same object
      expenseCategories.forEach((category) => {
        const total = expenseData
          .filter(
            (expense) =>
              expense.category_id === Number(category.id) &&
              isSameDay(new Date(expense.expense_date), date)
          )
          .reduce((sum, el) => sum + el.amount, 0);

        entry[category.name.toLowerCase()] = total;
      });

      data.push(entry);
    }
    // build chart config ONCE
    const chartConfig = Object.fromEntries(
      expenseCategories.map((category, index) => [
        category.name,
        {
          label: category.name,
          color: `var(--chart-${index + 1})`,
        },
      ])
    );
    // update state once
    return {
      data,
      chartConfig,
      title: t("expense.title"),
      description: t("expense.chart_description_2", { amount: sumExpense, symbol: '$' })
    } as ChartData<ChartRow>;
  }

  const chartData = useMemo(() => {
    return processChartData(Number(range));
  }, [expenseData, range]);

  const onChangePage = (page: number) => {
    dispatch(setPage(page));
    dispatch(getExpenses({ from: (dateFilter as DateRange)?.from?.toLocaleString(), to: (dateFilter as DateRange)?.to?.toLocaleString(), page, pageSize }));
  }

  const exportData = () => {
    // Implement export functionality here (e.g., generate CSV or Excel file)
    const header = [t("expense.export_category"), t("expense.export_amount", { symbol: "$" }), t("expense.export_date"), t("expense.export_description")];
    const rows = expenseData?.map(expense => [
      expense.category ? expense.category.name : "N/A",
      expense.amount,
      formatDate(expense.expense_date, "DD/MM/YYYY"),
      expense.description || ""
    ]) || [];
    exportToExcel(rows, header, "expenses", "Expenses");
  }

  return (
    <main>
      <div id="expense-table" className="">
        <div className="flex justify-between mb-4">
          <div id="filter">
            <DatePicker
              mode="range"
              date={dateFilter}
              max={31}
              setDate={(date) => {
                const range = date as DateRange;
                setDateFilter(date);
                if (range?.from && range.to) {
                  dispatch(getExpenses(
                    {
                      from: range?.from?.toLocaleString(),
                      to: range?.to?.toLocaleString()
                    }
                  ));
                }
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="mb-2 ml-2"
                onClick={() => {
                  setDateFilter(undefined);
                }}>
                {t("expense.button_reset")}
              </Button>
            </DatePicker>
          </div>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button id="add-expense" variant="ghost" onClick={() => {
                    // If there are no expense categories, show warning and do not open form
                    if (!expenseCategories || expenseCategories.length === 0) {
                      setOpenNoCategoryWarning(true);
                      return;
                    }
                    setExpenseSelected(prev => ({ ...prev, user_id: user?.id || null }));
                    setOpenExpenseForm(true);
                  }} >
                    <CirclePlus className="h-6 w-6 cursor-pointer" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("expense.button_add_expense")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button id="export" variant="ghost" className="mb-2 ml-2" onClick={exportData}>
                    <BookUp className="h-6 w-6 cursor-pointer" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("expense.button_export_data")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>
        </div>
        {/* header table (kept visible) */}
        <Table className="table-fixed w-full">
          {/* column widths must match between header and body tables */}
          <colgroup>
            <col style={{ width: '35%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <TableHeader className="bg-background">
            <TableRow>
              {header.map((head) => (
                <TableHead key={head}>{head}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>

        {/* scrollable body: keep its own table so header stays put */}
        <div className="max-h-[30vh] overflow-y-auto">
          <Table className="table-fixed w-full">
            <colgroup>
              <col style={{ width: '35%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <TableBody>
              {expenseData && expenseData.length > 0 ? expenseData.map((row) => (
                <TableRow id={row.id} key={row.id}>
                  <TableCell id="category">{row.category ? row.category.name : "N/A"}</TableCell>
                  <TableCell id="amount">{row.amount} {profile?.country?.currency || AppConstant.DATA.DEFAULT_CURRENCY.code}</TableCell>
                  <TableCell id="expense_date">{formatDate(row.expense_date?.toLocaleString()!, "DD/MM/YYYY")}</TableCell>
                  <TableCell id="notes">{row.description}</TableCell>
                  <TableCell className="w-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setOpenConfirmDeleteForm(true);
                        setExpenseSelected(row);
                      }}
                    >
                      <Trash size={25} className="text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={header.length} className="text-center">
                    {t("expense.empty_table_message")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <PaginationInteractive
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onChangePage}
        ></PaginationInteractive>
      </div>
      <div id="expense-chart" className="mt-8">
        {/* Chart */}
        <ChartInteractive
          range={range}
          setRange={setRange}
          chartData={chartData}
          type="bar"
        ></ChartInteractive>
      </div>
      {/* Dialog content */}
      {openExpenseForm &&
        <DialogForm
          title={t("expense.dialog_add_expense")}
          open={openExpenseForm}
          onOpenChange={(open) => setOpenExpenseForm(open)}
          OKFunc={handleAddExpense}>
          {/* Form fields go here */}
          <div id="category" className="mb-1">
            <Label htmlFor="category">{t("expense.label_category")}</Label>
            <Select
              name="category"
              required
              onValueChange={(value) => setExpenseSelected(prev => ({ ...prev, category_id: Number(value) }))}>
              <SelectTrigger className="w-50">
                <SelectValue placeholder={t("expense.placeholder_select_category")} />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={(category.id).toString()} >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div id="amount" className="mb-1">
            <Label htmlFor="amount">{t("expense.label_amount")}</Label>
            <Input
              type="number"
              name="amount"
              className="w-50" min={0}
              step={0.01}
              required
              value={expenseSelected.amount}
              onChange={(e) => handleInputChange(e)} />
          </div>
          <div id="date" className="mb-1">
            <Label htmlFor="date">{t("expense.label_date")}</Label>
            <DatePicker
              mode="single"
              date={expenseSelected?.expense_date ? new Date(expenseSelected.expense_date) : new Date()}
              setDate={(date) => setExpenseSelected(prev => ({ ...prev, expense_date: (date as Date)!.toLocaleString() }))}
            />
          </div>
          <div id="description" className="mb-1">
            <Label htmlFor="description">{t("expense.label_note")}</Label>
            <Textarea
              name="description"
              placeholder={t("expense.placeholder_notes")}
              value={expenseSelected?.description || ""}
              onChange={(e) => handleInputChange(e)} />
          </div>
        </DialogForm>
      }
      {openNoCategoryWarning &&
        <DialogForm
          title={t("expense.no_category_title")}
          description={<>
            {t("expense.no_category_message_part1")} <br />
            <Link to="/category" className="text-primary underline">{t("expense.go_to_category")}</Link>
          </>}
          open={openNoCategoryWarning}
          onOpenChange={(open) => setOpenNoCategoryWarning(open)}
          OKFunc={() => {
            // navigation to category page
            navigate("/category");
          }}
          OKBtnName={t("expense.go_to_category")}
        />
      }
      {openConfirmDeleteForm &&
        <DialogForm title={t("expense.dialog_delete_expense")} open={openConfirmDeleteForm} onOpenChange={(open) => setOpenConfirmDeleteForm(open)} OKFunc={handleDeleteExpense}>
          <p>{t("expense.delete_confirmation")}</p>
          <p>{t("expense.delete_warning")}</p>
        </DialogForm>
      }
    </main>
  )
}