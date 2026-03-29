import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, type RootState } from "@/store";
import { getRevenues, addRevenue, deleteRevenue, clearRevenues, setPage } from "@/store/revenue";
import { CirclePlus, Trash } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useSelector } from "react-redux";
import type { Revenue } from "@/interfaces/revenue";
import { formatDate } from "@/lib/utils";
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
import { format, isSameDay, subDays } from "date-fns";
import type { ChartRow } from "@/components/chart-interactive";
import ChartInteractive from "@/components/chart-interactive";
import { PaginationInteractive } from "@/components/pagination-interactive";

export default function Page() {
  const header = ["category", "amount", "date", "note", ""];
  const dispatch = useAppDispatch();
  const { data: revenueData } = useSelector((state: RootState) => state.revenue);
  const { page, pageSize, total } = useSelector((state: RootState) => ({
    page: state.revenue.page,
    pageSize: state.revenue.pageSize,
    total: state.revenue.total,
  }));
  const { data: categories } = useSelector((state: RootState) => state.categories);
  const { data: user } = useSelector((state: RootState) => state.auth);
  const [openRevenueForm, setOpenRevenueForm] = useState<boolean>(false);
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
  const [revenueSelected, setRevenueSelected] = useState<Revenue>(() => ({
    id: "",
    amount: 0,
    category_id: 0,
    category: null,
    user_id: null,
    revenue_date: new Date().toISOString(),
  }));
  const [range, setRange] = useState<string>("90");
  useEffect(() => {
    dispatch(getRevenues({ from: (dateFilter as DateRange)?.from?.toISOString(), to: (dateFilter as DateRange)?.to?.toISOString(), page, pageSize }));
    dispatch(getCategories());

    return () => {
      // clear slice when leaving the page
      dispatch(clearRevenues());
      dispatch(clearCategories());
    }
  }, [dispatch, dateFilter]);

  useEffect(() => {
    // refetch when pagination changes
    dispatch(getRevenues({ from: (dateFilter as DateRange)?.from?.toISOString(), to: (dateFilter as DateRange)?.to?.toISOString(), page, pageSize }));
  }, [dispatch, page, pageSize]);

  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
  }, [user, dispatch]);

  const revenueCategories = useMemo(() => categories ? categories.filter(category => category.type === "Revenue") : [], [categories]);

  const handleAddRevenue = async () => {
    if (!revenueSelected) return;
    const { id, category, ...payload } = revenueSelected;
    console.log("Submitting revenue:", payload);
    try {
      await dispatch(addRevenue(payload)).unwrap();
      setOpenRevenueForm(false);
      setRevenueSelected({
        id: "",
        amount: 0,
        category_id: 0,
        category: null,
        user_id: user?.id || null,
        revenue_date: new Date().toISOString(),
        description: "" // Ensure this is cleared
      });
    } catch (error) {
      console.error("Submission failed:", error);
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setRevenueSelected((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  }

  const updateField = (name: keyof Revenue, value: string) => {
    setRevenueSelected(prev => ({ ...prev, [name]: value }));
  }

  const handleDeleteRevenue = async () => {
    if (!revenueSelected.id) return;
    await dispatch(deleteRevenue(Number(revenueSelected.id))).unwrap();
    setOpenConfirmDeleteForm(false);
    setRevenueSelected({
      id: "",
      amount: 0,
      category_id: 0,
      category: null,
      user_id: user?.id || null,
      revenue_date: new Date().toISOString(),
      description: "" // Ensure this is cleared
    });
  }

  const sumRevenue = useMemo(() => {
    return revenueData?.reduce((accumulator, item) => accumulator + item.amount, 0);
  }, [revenueData])

  const processChartData = (days: number) => {
    const data = [] as ChartRow[];
    const now = new Date();

    if (!revenueData || !revenueCategories)
      return { data: [], chartConfig: {}, title: "Revenue", description: "Track your revenue trend over time." };

    // create base structure (one entry per date)
    for (let i = days; i >= 0; i--) {

      const date = subDays(now, i);

      const entry: ChartRow = {
        date: format(date, "MMM dd"),
      };

      // fill each category into same object
      revenueCategories.forEach((category) => {
        const total = revenueData
          .filter(
            (revenue) =>
              revenue.category_id === category.id &&
              isSameDay(new Date(revenue.revenue_date), date)
          )
          .reduce((sum, el) => sum + el.amount, 0);

        entry[category.name.toLowerCase()] = total;
      });

      data.push(entry);
    }

    // build chart config ONCE
    const chartConfig = Object.fromEntries(
      revenueCategories.map((category, index) => [
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
      title: "Revenue", 
      description: `Total revenue: ${AppConstant.DATA.DEFAULT_CURRENCY.symbol}${sumRevenue}` };
  }

  const chartData = useMemo(() => {
    return processChartData(Number(range));
  }, [revenueData, range]);

  const onPageChange = (newPage: number) => {
    // dispatch action to update page in the store
    dispatch(setPage(newPage));
    // this will trigger useEffect to refetch data for the new page
    dispatch(getRevenues({ from: (dateFilter as DateRange)?.from?.toISOString(), to: (dateFilter as DateRange)?.to?.toISOString(), page: newPage, pageSize }));
  }

  return (
    <main>
      <div className="flex justify-between mb-4">
        <div id="filter">
          <DatePicker
            mode="range"
            date={dateFilter}
            max={31}
            setDate={(date) => {
              setDateFilter(date);
              dispatch(getRevenues({ from: (date as DateRange)?.from?.toISOString(), to: (date as DateRange)?.to?.toISOString() }));
            }}
          >
            <Button
              variant="outline"
              size="sm"
              className="mb-2"
              onClick={() => {
                setDateFilter(undefined);
              }}>
              Reset
            </Button>
          </DatePicker>
        </div>
        <Button variant="ghost" onClick={() => { setRevenueSelected(prev => ({ ...prev, user_id: user?.id || null })); setOpenRevenueForm(true) }} >
          <CirclePlus className="h-6 w-6 cursor-pointer" />
        </Button>
      </div>
      {/* Table List */}
      <div id="table">
        <Table className="table-fixed w-full">
          <colgroup>
            <col style={{ width: '35%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
          </colgroup>
          <TableHeader>
            <TableRow>
              {header.map((head) => (
                <TableHead key={head}>{head}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
        <div className="max-h-[30vh] overflow-y-auto">
          <Table>
            <colgroup>
              <col style={{ width: '35%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <TableBody>
              {revenueData && revenueData.length > 0 ? revenueData.map((row, index) => (
                <TableRow id={row.id} key={index}>
                  <TableCell id="category">{row.category ? row.category.name : "N/A"}</TableCell>
                  <TableCell id="amount">{row.amount} {AppConstant.DATA.DEFAULT_CURRENCY.code}</TableCell>
                  <TableCell id="revenue_date">{formatDate(row.revenue_date?.toLocaleString()!, "DD/MM/YYYY")}</TableCell>
                  <TableCell id="notes">{row.description}</TableCell>
                  <TableCell className="w-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setOpenConfirmDeleteForm(true);
                        console.log(openConfirmDeleteForm);
                        setRevenueSelected(row);
                      }}
                    >
                      <Trash size={25} className="text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={header.length} className="text-center">
                    No revenue data available.
                  </TableCell>
                </TableRow>
              )}
              {/* {revenueData && revenueData.length > 0 && 
              <TableRow>
                <TableCell colSpan={header.length - 1}>
                  Total revenues
                </TableCell>
                <TableCell>
                  {sumRevenue} {AppConstant.DATA.DEFAULT_CURRENCY}
                </TableCell>
              </TableRow>} */}
            </TableBody>
          </Table>
        </div>
        <div id="pagination">
          <PaginationInteractive
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={onPageChange}
          />
        </div>
      </div>
      <div id="revenue-chart" className="mt-8">
        {/* Chart */}
        <ChartInteractive
          range={range}
          setRange={setRange}
          chartData={chartData}
        ></ChartInteractive>
      </div>
      {/* Dialog content */}
      {openRevenueForm &&
        <DialogForm
          title="Add New Revenue"
          open={openRevenueForm}
          onOpenChange={(open) => setOpenRevenueForm(open)}
          OKFunc={handleAddRevenue}>
          {/* Form fields go here */}
          <div id="category" className="mb-1">
            <Label htmlFor="category">Category:</Label>
            <Select name="category" required onValueChange={(value) => updateField("category_id", value)}>
              <SelectTrigger className="w-50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {revenueCategories.map((category) => (
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
              required
              value={revenueSelected.amount}
              onChange={(e) => handleInputChange(e)} />
          </div>
          <div id="date" className="mb-1">
            <Label htmlFor="date">Date:</Label>
            <DatePicker
              mode="single"
              date={revenueSelected?.revenue_date ? new Date(revenueSelected.revenue_date) : new Date()}
              setDate={(date) => updateField("revenue_date", (date as Date)!.toISOString())}
            />
          </div>
          <div id="description" className="mb-1">
            <Label htmlFor="description">Note:</Label>
            <Textarea
              name="description"
              placeholder="Enter any notes here..."
              value={revenueSelected?.description || ""}
              onChange={(e) => handleInputChange(e)} />
          </div>
        </DialogForm>
      }
      {openConfirmDeleteForm &&
        <DialogForm title={"Delete revenue"} open={openConfirmDeleteForm} onOpenChange={(open) => setOpenConfirmDeleteForm(open)} OKFunc={handleDeleteRevenue}>
          <p>Dow you want to delete revenue?</p>
          <p>If you delete, you can't restore again</p>
        </DialogForm>
      }
    </main>
  )
}