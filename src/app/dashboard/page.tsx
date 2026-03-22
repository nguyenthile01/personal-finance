import { useSelector } from "react-redux";
import SectionCard from "./component/section-card";
import { useAppDispatch, type RootState } from "@/store";
import { useEffect, useMemo, useState } from "react";
import { getExpenses, getExpenseComparision, clearExpense } from "@/store/expense";
import { clearRevenues, getRevenueComparision, getRevenues } from "@/store/revenue";
import type { DateRange } from "react-day-picker";
import { format, isSameDay, subDays } from "date-fns";
import type { ChartData } from "@/components/chart-interactive";
import ChartInteractive from "@/components/chart-interactive";

export default function Page() {
    const { currentTotal: currentRevenuesSum, lastTotal: lastRevenuesSum } = useSelector((state: RootState) => state.revenue);
    const { currentTotal: currentExpensesSum, lastTotal: lastExpensesSum } = useSelector((state: RootState) => state.expense);
    const { data: revenues } = useSelector((state: RootState) => state.revenue);
    const { data: expenses } = useSelector((state: RootState) => state.expense);
    const [chartData, setChartData] = useState<ChartData<any>>(() => ({
        data: [],
        chartConfig: {},
        title: "Expense",
        description: "Track your expense trend over time."
    }));
    const [range, setRange] = useState("90");
    const [dateFilter, setDateFilter] = useState<DateRange>(
        () => {
            const to = new Date();
            const from = subDays(to, Number(range));
            return {
                from: from,
                to: to
            }
        }
    );
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
    useEffect(() => {
        const to = new Date();
        const from = subDays(to, Number(range));
        setDateFilter({
            from: from,
            to: to
        });
    }, [range]);
    useEffect(() => {
        dispatch(getRevenues({ from: dateFilter.from?.toISOString(), to: dateFilter.to?.toISOString() }));
        dispatch(getExpenses({ from: dateFilter.from?.toISOString(), to: dateFilter.to?.toISOString() }));
        dispatch(getExpenseComparision());
        dispatch(getRevenueComparision());

        return () => {
            // clear slice when leaving the page
            dispatch(clearExpense());
            dispatch(clearRevenues());
        };
    }, [dispatch])
    const processChartData = (days: number) => {
        const data = [] as any[];
        const now = new Date();

        // Generate an array of dates for the last x-axis
        if (revenues && expenses) {
            for (let i = days; i >= 0; i--) {
                // Subtract "i" days from now
                const date = subDays(now, i);

                //format data into the same day
                const revenuesData = revenues
                    .filter((revenue) => isSameDay(new Date(revenue.revenue_date), date))
                    .reduce((sum, el) => sum + el.amount, 0);
                const expensesData = expenses
                    .filter((expense) => isSameDay(new Date(expense.expense_date), date))
                    .reduce((sum, el) => sum + el.amount, 0);
                data.push({
                    date: format(date, "MMM dd"),
                    revenues: revenuesData,
                    expenses: expensesData
                });
            }
        }
        //build chart config
        const chartConfig = {
            revenues: {
                label: "Revenues",
                color: "var(--chart-1)"
            },
            expenses: {
                label: "Expenses",
                color: "var(--chart-2)"
            }
        }
        // update state one
        setChartData((prev) => ({ ...prev, data, chartConfig }));
    }

    useMemo(() => {
        return processChartData(Number(range));
    }, [revenues, expenses, range]);
    return (
        <main>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <SectionCard
                    className="mr-2"
                    name="Revenues"
                    description={"Total Revenues"}
                    title={currentRevenuesSum?.toString() || "0"}
                    percentage={percentage(currentRevenuesSum!, lastRevenuesSum!)}
                    url="/expenses" />
                <SectionCard
                    name="Expenses"
                    description={"Total Expenses"}
                    title={currentExpensesSum?.toString() || "0"}
                    percentage={percentage(currentExpensesSum!, lastExpensesSum!)}
                    url="/expenses" />
            </div>
            <div id="expense-chart" className="mt-8">
                {/* Chart */}
                <ChartInteractive
                    range={range}
                    setRange={setRange}
                    chartData={chartData}
                ></ChartInteractive>
            </div>
        </main>
    )
}