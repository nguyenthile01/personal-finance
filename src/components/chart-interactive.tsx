"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { GitCommitHorizontal } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

export interface ChartData<T> {
    data: T[],
    chartConfig: ChartConfig,
    title: string,
    description: string
}

// Generic chart row where keys are column names (e.g. 'date', 'revenues', 'cat_1')
export type ChartRow = Record<string, number | string>
const rangeOptions = [
    { label: "1 Week", value: "7" },
    { label: "1 Month", value: "30" },
    { label: "3 Months", value: "90" },
]

export default function ChartInteractive(
    { range, setRange, chartData, chartHeight = 50 }:
        { range: string, setRange: (range: string) => void, chartData: ChartData<ChartRow>, chartHeight?: number }) {

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{chartData.title}</CardTitle>
                    <CardDescription>{chartData.description}</CardDescription>
                </div>
                <Tabs value={range} onValueChange={setRange} className="w-[300px]">
                    <TabsList className="grid w-full grid-cols-3">
                        {rangeOptions.map((option) => (
                            <TabsTrigger key={option.value} value={option.value}>
                                {option.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartData.chartConfig} className={cn("w-full", chartHeight ? `max-h-[${chartHeight}vh]` : "max-h-[50vh]")}>
                    {/* Line Chart */}
                    <LineChart
                        data={chartData.data}
                        margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
                        <XAxis dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32} />
                        <YAxis hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        {Object.entries(chartData.chartConfig).map(([key, value]) => (
                            <Line
                                key={key}
                                dataKey={String(value?.label ?? key).toLowerCase()} // Assuming the dataKey in chartData matches the label in chartConfig
                                type="monotone"
                                stroke={value.color} // Use a hex code instead of var()
                                strokeWidth={2}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
                {Object.entries(chartData.chartConfig).map(([key, value]) => (
                    <Button variant="ghost" key={key}>
                        <GitCommitHorizontal
                            style={{ color: value.color }}
                            className="size-4 mr-2" />
                        {value.label}
                    </Button>
                ))}
            </CardFooter>
        </Card>
    )
}