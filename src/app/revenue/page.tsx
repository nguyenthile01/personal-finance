import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, type RootState } from "@/store";
import { getRevenues, addRevenue, deleteRevenue, clearRevenues, setPage } from "@/store/revenue";
import { BookUp, CirclePlus, Trash } from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { Revenue } from "@/interfaces/revenue";
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
import { format, isSameDay, subDays } from "date-fns";
import type { ChartRow } from "@/components/chart-interactive";
import ChartInteractive from "@/components/chart-interactive";
import { PaginationInteractive } from "@/components/pagination-interactive";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { clearProfile, getProfile } from "@/store/profile";

export default function Page() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const header = ["revenue.table_category", "revenue.table_amount", "revenue.table_date", "revenue.table_note", ""];
  const dispatch = useAppDispatch();
  const { data: revenueData } = useSelector((state: RootState) => state.revenue);
  const { data: profile } = useSelector((state: RootState) => state.profile);
  const { page, pageSize, total } = useSelector((state: RootState) => ({
    page: state.revenue.page,
    pageSize: state.revenue.pageSize,
    total: state.revenue.total,
  }));
  const { data: categories } = useSelector((state: RootState) => state.categories);
  const { data: user } = useSelector((state: RootState) => state.auth);
  const [openRevenueForm, setOpenRevenueForm] = useState<boolean>(false);
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
  const [revenueSelected, setRevenueSelected] = useState<Revenue>(() => ({
    id: "",
    amount: 0,
    category_id: 0,
    category: null,
    user_id: null,
    revenue_date: new Date().toLocaleString(),
  }));
  const [range, setRange] = useState<string>("90");

  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
  }, [user, dispatch]);
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getProfile(user?.id || ""));
    return () => {
      dispatch(clearCategories());
      dispatch(clearProfile());
    }
  }, [dispatch])
  useEffect(() => {
    dispatch(getRevenues({ from: (dateFilter as DateRange)?.from?.toLocaleString(), to: (dateFilter as DateRange)?.to?.toLocaleString(), page, pageSize }));
    return () => {
      // clear slice when leaving the page
      dispatch(clearRevenues());
    }
  }, [dispatch, dateFilter, page, pageSize]);

  useEffect(() => {
    // refetch when pagination changes
    dispatch(getRevenues({ from: (dateFilter as DateRange)?.from?.toLocaleString(), to: (dateFilter as DateRange)?.to?.toLocaleString(), page, pageSize }));
    // clear slice when leaving the page
    return () => {
      dispatch(clearRevenues());
    }
  }, [dispatch, page, pageSize]);

  const revenueCategories = useMemo(() => categories ? categories.filter(category => category.type === "Revenue") : [], [categories]);

  const handleAddRevenue = async () => {
    if (!revenueSelected) return;
    // const { id, category, ...payload } = revenueSelected;
    const payload = {
      amount: revenueSelected.amount,
      category_id: revenueSelected.category_id,
      user_id: revenueSelected.user_id,
      revenue_date: revenueSelected.revenue_date,
      description: revenueSelected.description
    }
    try {
      await dispatch(addRevenue(payload)).unwrap();
      setOpenRevenueForm(false);
      setRevenueSelected({
        id: "",
        amount: 0,
        category_id: 0,
        category: null,
        user_id: user?.id || null,
        revenue_date: new Date().toLocaleString(),
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
      revenue_date: new Date().toLocaleString(),
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
      return { data: [], chartConfig: {}, title: t("revenue.title"), description: t("revenue.chart_description_1") };

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
              revenue.category_id === Number(category.id) &&
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
      title: t("revenue.title"),
      description: t("revenue.chart_description_2", { amount: sumRevenue, symbol: "$" })
    };
  }

  const chartData = useMemo(() => {
    return processChartData(Number(range));
  }, [revenueData, range]);

  const onPageChange = (newPage: number) => {
    // dispatch action to update page in the store
    dispatch(setPage(newPage));
    // this will trigger useEffect to refetch data for the new page
    dispatch(getRevenues({ from: (dateFilter as DateRange)?.from?.toLocaleString(), to: (dateFilter as DateRange)?.to?.toLocaleString(), page: newPage, pageSize }));
  }

  const exportData = () => {
    // Implement export functionality here (e.g., generate CSV or Excel file)
    const header = [t("revenue.export_category"), t("revenue.export_amount"), t("revenue.export_date"), t("revenue.export_description")];
    const rows = revenueData?.map(revenue => [
      revenue.category ? revenue.category.name : "N/A",
      revenue.amount,
      formatDate(revenue.revenue_date, "DD/MM/YYYY"),
      revenue.description || ""
    ]) || [];
    exportToExcel(rows, header, "revenues", "Revenues");
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
              dispatch(getRevenues({ from: (date as DateRange)?.from?.toLocaleString(), to: (date as DateRange)?.to?.toLocaleString() }));
            }}
          >
            <Button
              variant="outline"
              size="sm"
              className="mb-2"
              onClick={() => {
                setDateFilter(undefined);
              }}>
              {t("revenue.button_reset")}
            </Button>
          </DatePicker>
        </div>
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" onClick={() => {
                  // If there are no revenue categories, show warning dialog and don't open form
                  if (!revenueCategories || revenueCategories.length === 0) {
                    setOpenNoCategoryWarning(true);
                    return;
                  }
                  setRevenueSelected(prev => ({ ...prev, user_id: user?.id || null }));
                  setOpenRevenueForm(true);
                }} >
                  <CirclePlus className="h-6 w-6 cursor-pointer" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("revenue.button_add_revenue")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button id="export" variant="ghost" className="mb-2 ml-2" onClick={exportData}>
                  <BookUp className="h-6 w-6 cursor-pointer" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("revenue.button_export_data")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
                <TableHead key={head}>{t(head)}</TableHead>
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
                  <TableCell id="amount">{row.amount} {profile?.country?.currency || AppConstant.DATA.DEFAULT_CURRENCY.symbol}</TableCell>
                  <TableCell id="revenue_date">{formatDate(row.revenue_date?.toLocaleString()!, "DD/MM/YYYY")}</TableCell>
                  <TableCell id="notes">{row.description}</TableCell>
                  <TableCell className="w-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setOpenConfirmDeleteForm(true);
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
                    {t("revenue.empty_table_message")}
                  </TableCell>
                </TableRow>
              )}
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
          type="bar"
        ></ChartInteractive>
      </div>
      {/* Dialog content */}
      {openRevenueForm &&
        <DialogForm
          title={t("revenue.dialog_add_revenue")}
          open={openRevenueForm}
          onOpenChange={(open) => setOpenRevenueForm(open)}
          OKFunc={handleAddRevenue}>
          {/* Form fields go here */}
          <div id="category" className="mb-1">
            <Label htmlFor="category">Category:</Label>
            <Select name="category" required onValueChange={(value) => updateField("category_id", value)}>
              <SelectTrigger className="w-50">
                <SelectValue placeholder={t("revenue.label_category")} />
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
            <Label htmlFor="amount">{t("revenue.label_amount")}</Label>
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
              setDate={(date) => updateField("revenue_date", (date as Date).toLocaleString())}
            />
          </div>
          <div id="note" className="mb-1">
            <Label htmlFor="note">{t("revenue.label_note")}</Label>
            <Textarea
              name="note"
              placeholder={t("revenue.placeholder_notes")}
              value={revenueSelected?.description || ""}
              onChange={(e) => handleInputChange(e)} />
          </div>
        </DialogForm>
      }
      {openNoCategoryWarning &&
        <DialogForm
          title={t("revenue.no_category_title")}
          description={<>
            {t("revenue.no_category_message_part1")} <br />
            <Link to="/category" className="text-primary underline">{t("revenue.go_to_category")}</Link>
          </>}
          open={openNoCategoryWarning}
          onOpenChange={(open) => setOpenNoCategoryWarning(open)}
          OKFunc={() => {
            // navigate user to category page
            navigate("/category");
          }}
          OKBtnName={t("revenue.go_to_category")}
        />
      }
      {openConfirmDeleteForm &&
        <DialogForm title={t("revenue.dialog_delete_revenue")} open={openConfirmDeleteForm} onOpenChange={(open) => setOpenConfirmDeleteForm(open)} OKFunc={handleDeleteRevenue}>
          <p>{t("revenue.delete_confirmation")}</p>
          <p>{t("revenue.delete_warning")}</p>
        </DialogForm>
      }
    </main>
  )
}