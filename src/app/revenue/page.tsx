import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, type RootState } from "@/store";
import { getRevenues, addRevenue, deleteRevenue } from "@/store/revenue";
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
import { getCategories } from "@/store/category";
import { AppConstant } from "@/interfaces/app-common";
import { getUser } from "@/store/auth";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";

export default function Page() {
  const header = ["category", "amount", "date", "note", ""];
  const dispatch = useAppDispatch();
  const { data: revenueData } = useSelector((state: RootState) => state.revenue);
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
  useEffect(() => {
    dispatch(getRevenues({ from: (dateFilter as DateRange)?.from?.toISOString(), to: (dateFilter as DateRange)?.to?.toISOString() }));
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
    setRevenueSelected((prev) => ({ ...prev, user_id: user!.id }));
  }, [user, dispatch]);

  const revenueCategories = useMemo(() => categories ? categories.filter(category => category.type === "Revenue") : [], [categories]);

  const handleAddRevenue = async () => {
    if (!revenueSelected) return;
    const { id, category, ...payload } = revenueSelected;
    try {
      await dispatch(addRevenue(payload));
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
    await dispatch(deleteRevenue(Number(revenueSelected.id)));
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
          />
        </div>
        <Button variant="ghost" onClick={() => { setOpenRevenueForm(true) }} >
          <CirclePlus className="h-6 w-6 cursor-pointer" />
        </Button>
      </div>
      <Table className="overflow-y-auto">
        <TableHeader>
          <TableRow>
            {header.map((head) => (
              <TableHead key={head}>{head}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {revenueData && revenueData.length > 0 ? revenueData.map((row, index) => (
            <TableRow id={row.id} key={index}>
              <TableCell id="category">{row.category ? row.category.name : "N/A"}</TableCell>
              <TableCell id="amount">{row.amount} {AppConstant.DATA.DEFAULT_CURRENCY}</TableCell>
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
          {revenueData && revenueData.length > 0 && <TableRow>
            <TableCell colSpan={header.length - 1}>
              Total revenues
            </TableCell>
            <TableCell>
              {sumRevenue} {AppConstant.DATA.DEFAULT_CURRENCY}
            </TableCell>
          </TableRow>}
        </TableBody>
      </Table>
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