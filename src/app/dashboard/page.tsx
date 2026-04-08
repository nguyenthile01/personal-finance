import { useSelector } from "react-redux";
import SectionCard from "./component/section-card";
import { useAppDispatch, type RootState } from "@/store";
import { useEffect, useMemo, useState } from "react";
import { getExpenses, clearExpense } from "@/store/expense";
import { clearRevenues, getRevenues } from "@/store/revenue";
import type { DateRange } from "react-day-picker";
import { format, isSameDay, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import type { ChartData, ChartRow } from "@/components/chart-interactive";
import ChartInteractive from "@/components/chart-interactive";
import { useTranslation } from "react-i18next";

export default function Page() {
  const { t } = useTranslation();
  const { data: revenues } = useSelector((state: RootState) => state.revenue);
  const { data: expenses } = useSelector((state: RootState) => state.expense);
  // chart rows have a date plus named numeric series (revenues/expenses)

  const [range, setRange] = useState("90");

  // dateFilter is derived from range; compute with useMemo instead of setting state in an effect
  const dateFilter = useMemo<DateRange>(() => {
    const to = new Date();
    const from = subDays(to, Number(range));
    return { from, to };
  }, [range]);
  const dispatch = useAppDispatch();
  const percentage = (current: number, last: number) => {
    if (current && last) {
      if (last === 0)
        return current > 0 ? 100 : 0
      return ((current - last) / last) * 100
    } else {
      return 0;
    }
  }

  // compute current and last totals by calendar month
  const currentRevenuesSum = useMemo(() => {
    if (!revenues) return 0;
    const now = new Date();
    const from = startOfMonth(now);
    const to = endOfMonth(now);
    return revenues.reduce((sum, r) => {
      const d = new Date(r.revenue_date);
      return d >= from && d <= to ? sum + (r.amount || 0) : sum;
    }, 0);
  }, [revenues]);

  const lastRevenuesSum = useMemo(() => {
    if (!revenues) return 0;
    const now = new Date();
    const prev = subMonths(now, 1);
    const from = startOfMonth(prev);
    const to = endOfMonth(prev);
    return revenues.reduce((sum, r) => {
      const d = new Date(r.revenue_date);
      return d >= from && d <= to ? sum + (r.amount || 0) : sum;
    }, 0);
  }, [revenues]);

  const currentExpensesSum = useMemo(() => {
    if (!expenses) return 0;
    const now = new Date();
    const from = startOfMonth(now);
    const to = endOfMonth(now);
    return expenses.reduce((sum, e) => {
      const d = new Date(e.expense_date);
      return d >= from && d <= to ? sum + (e.amount || 0) : sum;
    }, 0);
  }, [expenses]);

  const lastExpensesSum = useMemo(() => {
    if (!expenses) return 0;
    const now = new Date();
    const prev = subMonths(now, 1);
    const from = startOfMonth(prev);
    const to = endOfMonth(prev);
    return expenses.reduce((sum, e) => {
      const d = new Date(e.expense_date);
      return d >= from && d <= to ? sum + (e.amount || 0) : sum;
    }, 0);
  }, [expenses]);
  // dateFilter is derived from range via useMemo; no need to set state here
  useEffect(() => {
    dispatch(getRevenues({ from: dateFilter.from?.toLocaleString(), to: dateFilter.to?.toLocaleString(), page: 1, pageSize: 1000 }));
    dispatch(getExpenses({ from: dateFilter.from?.toLocaleString(), to: dateFilter.to?.toLocaleString(), page: 1, pageSize: 1000 }));

    return () => {
      // clear slice when leaving the page
      dispatch(clearExpense());
      dispatch(clearRevenues());
    };
  }, [dispatch, dateFilter])
  const chartData = useMemo<ChartData<ChartRow>>(() => {
    const data: ChartRow[] = [];
    const now = new Date();


    for (let i = Number(range); i >= 0; i--) {
      const date = subDays(now, i);

      const revenuesData = revenues ? revenues
        .filter((revenue) => isSameDay(new Date(revenue.revenue_date), date))
        .reduce((sum, el) => sum + el.amount, 0) : 0;
      const expensesData = expenses ? expenses
        .filter((expense) => isSameDay(new Date(expense.expense_date), date))
        .reduce((sum, el) => sum + el.amount, 0) : 0;

      data.push({ date: format(date, "MMM dd"), revenues: revenuesData, expenses: expensesData });
    }

    const chartConfig = {
      revenues: { label: t("dashboard.chart_revenues"), color: "var(--chart-1)" },
      expenses: { label: t("dashboard.chart_expenses"), color: "var(--chart-2)" },
    };

    return { data, chartConfig, title: "", description: "" };
  }, [revenues, expenses, range]);
  return (
    <main>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <SectionCard
          className="mr-2"
          description={t("dashboard.dashboard_total_revenues")}
          title={currentRevenuesSum?.toString() || "0"}
          percentage={percentage(currentRevenuesSum, lastRevenuesSum)}
          url="/revenue"
          buttonLabel={t("dashboard.card_button_1")}
          footer_description={
            t("dashboard.card_description_1", {
              name: t("dashboard.dashboard_revenues"),
              value: percentage(currentRevenuesSum, lastRevenuesSum) > 0 ? t("dashboard.increase") : percentage(currentRevenuesSum, lastRevenuesSum) < 0 ? t("dashboard.decrease") : t("dashboard.stable"),
              percentage: (Math.abs(percentage(currentRevenuesSum, lastRevenuesSum)).toFixed(2)).toString()
            })
          }
          currency={"$"} />
        <SectionCard
          description={t("dashboard.dashboard_total_expenses")}
          title={currentExpensesSum?.toString() || "0"}
          percentage={percentage(currentExpensesSum, lastExpensesSum)}
          url="/expenses"
          buttonLabel={t("dashboard.card_button_1")}
          footer_description={
            t("dashboard.card_description_1", {
              name: t("dashboard.dashboard_expenses"),
              value: percentage(currentExpensesSum, lastExpensesSum) > 0 ? t("dashboard.increase") : percentage(currentExpensesSum, lastExpensesSum) < 0 ? t("dashboard.decrease") : t("dashboard.stable"),
              percentage: (Math.abs(percentage(currentExpensesSum, lastExpensesSum)).toFixed(2)).toString()
            })
          }
          currency={"$"} />
      </div>
      <div id="expense-chart" className="mt-8">
        {/* Chart */}
        <ChartInteractive
          range={range}
          setRange={setRange}
          chartData={chartData}
          type="line"
        ></ChartInteractive>
      </div>
    </main>
  )
}