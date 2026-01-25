import { useSelector } from "react-redux";
import SectionCard from "./component/section-card";
import { useAppDispatch, type RootState } from "@/store";
import { useEffect, useState } from "react";
import { getExpenses, getExpenseComparision } from "@/store/expense";
import { getRevenueComparision, getRevenues } from "@/store/revenue";
import ChartInteractive from "./component/chart-interactive";
import type { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

export default function Page() {
    const { currentTotal: currentRevenuesSum, lastTotal: lastRevenuesSum } = useSelector((state: RootState) => state.revenue);
    const { currentTotal: currentExpensesSum, lastTotal: lastExpensesSum } = useSelector((state: RootState) => state.expense);
    const { data: revenues } = useSelector((state: RootState) => state.revenue);
    const { data: expenses } = useSelector((state: RootState) => state.expense);
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
    }, [dispatch])
    return (
        <main>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <SectionCard
                    className="mr-2"
                    name="Revenues"
                    description={"Total Revenues"}
                    title={currentRevenuesSum?.toString() || "0"}
                    percentage={percentage(currentRevenuesSum!, lastRevenuesSum!)}
                    url="/expenses"/>
                <SectionCard
                    name="Expenses"
                    description={"Total Expenses"}
                    title={currentExpensesSum?.toString() || "0"}
                    percentage={percentage(currentExpensesSum!, lastExpensesSum!)}
                    url="/expenses" />
            </div>
            <ChartInteractive
                revenues={revenues}
                expenses={expenses}
                range={range}
                setRange={(range) => setRange(range)} />
        </main>
    )
}