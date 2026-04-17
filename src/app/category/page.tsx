import DialogForm from "@/components/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Category } from "@/interfaces/category";
import type { ErrorResponse } from "@/interfaces/error";
import { useAppDispatch, type RootState } from "@/store";
import { getUser } from "@/store/auth";
import { addCategory, clearCategories, deleteCategory, getCategories, updateCategory } from "@/store/category";
import { format } from "date-fns";
import { CirclePlus, SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const categoryTypes: Record<string, string> = {
  "Revenue": "category.revenue",
  "Expense": "category.expense"
};

export default function Page() {
  const { t } = useTranslation();
  const header = ["category.title", "category.table_type", "category.table_created_at", ""];
  const { data: categories } = useSelector((state: RootState) => state.categories);
  const { data: user } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const [isOpenDialogForm, setIsOpenDialogForm] = useState(false);
  const [openConfirmDeleteForm, setOpenConfirmDeleteForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user) {
      dispatch(getUser());
    }
  }, [user, dispatch]);

  const [category, setCategory] = useState<Category>({
    id: "",
    name: "",
    type: "Revenue",
    user_id: user ? user.id : ""
  });

  useEffect(() => {
    dispatch(getCategories());
    return () => {
      // Cleanup if needed when component unmounts
      dispatch(clearCategories());
    }
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle input change if needed
    const { name, value } = e.target;
    // Update the state or perform any necessary actions
    setCategory(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEditCategory = async () => {
    // Logic for adding/editing a category
    if (category.id) {
      // Edit existing category
      const payload = {
        id: category.id,
        name: category.name,
        type: category.type,
        user_id: user ? user.id : ""
      }
      await dispatch(updateCategory(payload)).unwrap();
      setIsOpenDialogForm(false);
      setCategory(prev => ({ ...prev, id: "", name: "", type: "Revenue" }));
    } else {
      // Add new category
      try {
        const payload = {
          name: category.name,
          type: category.type,
          user_id: user ? user.id : ""
        }
        await dispatch(addCategory(payload)).unwrap();
        setIsOpenDialogForm(false);
        setCategory(prev => ({ ...prev, name: "", type: "Revenue" }));
      } catch (error) {
        setErrorMessage(t((error as ErrorResponse).details, { name: t("category.title") }));
      }
    }
  };

  return (
    <main className="p-4">
      <div className="flex items-center justify-end mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button id="add-category" variant="ghost" onClick={() => setIsOpenDialogForm(true)}>
                <CirclePlus className="h-6 w-6 cursor-pointer" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("category.button_add_category")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
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
              <TableHead key={head}>{t(head)}</TableHead>
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
            {categories && categories.length > 0 ? categories.map((row) => (
              <TableRow id={row.id.toString()} key={row.id}>
                <TableCell id="name">{row.name ? t(row.name) : "N/A"}</TableCell>
                <TableCell id="type">{row.type ? t(row.type) : "N/A"}</TableCell>
                <TableCell id="created_at">{row.created_at ? format(new Date(row.created_at), "dd/MM/yyyy") : "N/A"}</TableCell>
                <TableCell className="w-10">
                  {/* <Button variant="ghost" size="icon" className="text-red-500" onClick={() => {
                    setOpenConfirmDeleteForm(true);
                  }}>
                    <Trash2 className="size-4" />
                  </Button> */}
                  <Button variant="ghost" size="icon" className="text-blue-500" onClick={() => {
                    setCategory(row);
                    setIsOpenDialogForm(true);
                  }}>
                    <SquarePen className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={header.length} className="text-center">
                  {t("category.empty_table_message")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DialogForm
        title={t("category.dialog_add_category")}
        open={isOpenDialogForm}
        onOpenChange={(open) => {
          setIsOpenDialogForm(open);
          if (!open) {
            setErrorMessage("");
            setCategory(prev => ({ ...prev, name: "", type: "Revenue" }));
          }
        }}
        OKFunc={() => { handleAddEditCategory(); }}
      >
        {/* Form fields */}
        <div>
          <Label htmlFor="name" className="mb-1">{t("category.label_name")}</Label>
          <Input
            id="name"
            name="name"
            required
            className="mb-2"
            placeholder={t("category.field_name_placeholder") || ""}
            value={category.name}
            onChange={handleInputChange} />

          <Label htmlFor="category-type" className="mb-1">{t("category.label_type")}</Label>
          <Select name="category-type" required defaultValue={category.type.toString()} onValueChange={(value) => setCategory(prev => ({ ...prev, type: value }))}>
            <SelectTrigger className="w-100">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryTypes && Object.entries(categoryTypes).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {t(label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
        </div>
      </DialogForm>
      <DialogForm
        title={t("category.dialog_delete_category")}
        open={openConfirmDeleteForm}
        onOpenChange={(open) => setOpenConfirmDeleteForm(open)}
        OKFunc={async () => {
          await dispatch(deleteCategory(Number(category.id))).unwrap();
          setOpenConfirmDeleteForm(false);
          setCategory((prev) => ({ ...prev, id: "", name: "", type: "Revenue" }));
        }}>
        <p>{t("category.delete_confirmation")}</p>
        <p>{t("category.delete_warning")}</p>

      </DialogForm>
    </main>
  );
}
