"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Expense } from "@/interfaces/expense";
import type { Revenue } from "@/interfaces/revenue";
import { format, isSameDay, subDays } from "date-fns";
import { GitCommitHorizontal } from "lucide-react";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
const chartConfig = {
    revenues: {
        label: "Revenues",
        color: "var(--chart-1)", // Usually Green
    },
    expenses: {
        label: "Expenses",
        color: "var(--chart-2)", // Usually Red
    },
} satisfies ChartConfig

export default function ChartInteractive(
    { range, setRange, revenues, expenses }:
        { range: string, setRange: (range: string) => void, revenues: Revenue[] | null, expenses: Expense[] | null }) {

    const processChartData = (days: number) => {
        const data = [];
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
        return data;
    }

    const chartData = useMemo(() => {
        return processChartData(Number(range));
    }, [revenues, expenses, range]);

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>Comparing income vs spending</CardDescription>
                </div>
                <Tabs value={range} onValueChange={setRange} className="w-[300px]">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value={"7"}>1 Week</TabsTrigger>
                        <TabsTrigger value="30">1 Month</TabsTrigger>
                        <TabsTrigger value="90">3 Months</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full">
                    {/* Area Chart */}
                    {/* <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
                        <XAxis dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32} />
                        <YAxis hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <defs>
                            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-revenues)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-revenues)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>

                        <Area
                            dataKey="revenues"
                            type="natural"
                            fill="url(#fillRevenue)"
                            stroke="var(--color-revenues)"
                            stackId="a"
                        />
                        <Area
                            dataKey="expenses"
                            type="natural"
                            fill="url(#fillExpense)"
                            stroke="var(--color-expenses)"
                            stackId="b"
                        />
                    </AreaChart> */}
                    {/* Line Chart */}
                    <LineChart
                        data={chartData}
                        margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
                        <XAxis dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32} />
                        <YAxis hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                            dataKey="expenses"
                            type="monotone"
                            stroke="var(--color-expenses)" // Use a hex code instead of var()
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            dataKey="revenues"
                            type="monotone"
                            stroke="var(--color-revenues)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <Button variant="ghost">
                    <GitCommitHorizontal 
                        style={{ color: "var(--chart-1)" }} 
                        className="size-4 mr-2"/>
                    Revenues
                </Button>
                <Button variant="ghost">
                    <GitCommitHorizontal 
                        style={{ color: "var(--chart-2)" }} 
                        className="size-4 mr-2"/>
                    Expense
                </Button>
            </CardFooter>
        </Card>
    )
}