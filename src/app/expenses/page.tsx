import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, type RootState } from "@/store";
import { CirclePlus, Trash } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useSelector } from "react-redux";
import { formatDate } from "@/lib/utils";
import DialogForm from "@/components/form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { getCategories } from "@/store/category";
import { AppConstant } from "@/interfaces/app-common";
import { getUser } from "@/store/auth";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/interfaces/expense";
import { addExpense, deleteExpense, getExpenses } from "@/store/expense";
import { subDays, format } from "date-fns";
import type { ChartData } from "@/components/chart-interactive";
import { isSameDay } from "date-fns";
import ChartInteractive from "@/components/chart-interactive";

export default function Page() {
  const header = ["category", "amount", "date", "note", ""];
  const dispatch = useAppDispatch();
  const { data: expenseData } = useSelector((state: RootState) => state.expense);
  const { data: categories } = useSelector((state: RootState) => state.categories);
  const { data: user } = useSelector((state: RootState) => state.auth);
  const [openExpenseForm, setOpenExpenseForm] = useState<boolean>(false);
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
    expense_date: new Date().toISOString(),
  }));
  const [chartData, setChartData] = useState<ChartData<any>>(() => ({
    data: [],
    chartConfig: {},
    title: "Expense",
    description: "Track your expense trend over time."
  }));
  const [range, setRange] = useState<string>("90");
  useEffect(() => {
    dispatch(getExpenses({ from: (dateFilter as DateRange)?.from?.toISOString(), to: (dateFilter as DateRange)?.to?.toISOString() }));
    dispatch(getCategories());
    return () => {
      // clear slice when leaving the page
      dispatch(getExpenses({ from: (dateFilter as DateRange)?.from?.toISOString(), to: (dateFilter as DateRange)?.to?.toISOString() }));
      dispatch(getCategories());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
    setExpenseSelected((prev) => ({ ...prev, user_id: user!.id }));
  }, [user, dispatch]);

  const expenseCategories = useMemo(() => categories ? categories.filter(category => category.type === "Expense") : [], [categories]);

  const handleAddExpense = async () => {
    if (!expenseSelected) return;
    const { id, category, ...payload } = expenseSelected;
    try {
      await dispatch(addExpense(payload));
      setOpenExpenseForm(false);
      setExpenseSelected({
        id: "",
        amount: 0,
        category_id: 0,
        category: null,
        user_id: user?.id || null,
        expense_date: new Date().toISOString(),
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

  const updateField = (name: keyof Expense, value: string) => {
    setExpenseSelected(prev => ({ ...prev, [name]: value }));
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
      expense_date: new Date().toISOString(),
      description: "" // Ensure this is cleared
    });
  }

  const processChartData = (days: number) => {
    const data = [] as any[];
    const now = new Date();

    if (!expenseData || !expenseCategories) return;

    // create base structure (one entry per date)
    for (let i = days; i >= 0; i--) {
      const date = subDays(now, i);

      const entry: any = {
        date: format(date, "MMM dd"),
      };

      // fill each category into same object
      expenseCategories.forEach((category) => {
        const total = expenseData
          .filter(
            (expense) =>
              expense.category_id === category.id &&
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
    setChartData((prev) => ({ ...prev,  data, chartConfig  }));
  }

  useMemo(() => {
    processChartData(Number(range));
  }, [expenseData, range]);

  const sumExpense = useMemo(() => {
    return (expenseData ?? []).reduce((accumulator, item) => accumulator + (item.amount || 0), 0);
  }, [expenseData])

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
                      from: range?.from?.toISOString(),
                      to: range?.to?.toISOString()
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
                Reset
              </Button>
            </DatePicker>
          </div>
          <Button variant="ghost" onClick={() => { setOpenExpenseForm(true) }} >
            <CirclePlus className="h-6 w-6 cursor-pointer" />
          </Button>
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
                  <TableCell id="amount">{row.amount} {AppConstant.DATA.DEFAULT_CURRENCY}</TableCell>
                  <TableCell id="expense_date">{formatDate(row.expense_date?.toLocaleString()!, "DD/MM/YYYY")}</TableCell>
                  <TableCell id="notes">{row.description}</TableCell>
                  <TableCell className="w-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setOpenConfirmDeleteForm(true);
                        console.log(openConfirmDeleteForm);
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
                    No expense data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between mt-2">
          <p className="px-2">Total expenses:</p>
          <p className="px-2">{sumExpense} {AppConstant.DATA.DEFAULT_CURRENCY}</p>
        </div>
      </div>
      <div id="expense-chart" className="mt-8">
        {/* Chart */}
        <ChartInteractive
          range={range}
          setRange={setRange}
          chartData={chartData}
        ></ChartInteractive>
      </div>
      {/* Dialog content */}
      {openExpenseForm &&
        <DialogForm
          title="Add New Expense"
          open={openExpenseForm}
          onOpenChange={(open) => setOpenExpenseForm(open)}
          OKFunc={handleAddExpense}>
          {/* Form fields go here */}
          <div id="category" className="mb-1">
            <Label htmlFor="category">Category:</Label>
            <Select name="category" required onValueChange={(value) => updateField("category_id", value)}>
              <SelectTrigger className="w-50">
                <SelectValue placeholder="Select category" />
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
            <Label htmlFor="amount">Amount:</Label>
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
            <Label htmlFor="date">Date:</Label>
            <DatePicker
              mode="single"
              date={expenseSelected?.expense_date ? new Date(expenseSelected.expense_date) : new Date()}
              setDate={(date) => updateField("expense_date", (date as Date)!.toISOString())}
            />
          </div>
          <div id="description" className="mb-1">
            <Label htmlFor="description">Note:</Label>
            <Textarea
              name="description"
              placeholder="Enter any notes here..."
              value={expenseSelected?.description || ""}
              onChange={(e) => handleInputChange(e)} />
          </div>
        </DialogForm>
      }
      {openConfirmDeleteForm &&
        <DialogForm title={"Delete expense"} open={openConfirmDeleteForm} onOpenChange={(open) => setOpenConfirmDeleteForm(open)} OKFunc={handleDeleteExpense}>
          <p>Dow you want to delete expense?</p>
          <p>If you delete, you can't restore again</p>
        </DialogForm>
      }
    </main>
  )
}