import type { Category } from "./category";

export type Expense = {
  id: string;
  amount: number;
  category_id: number;
  expense_date: string;
  user_id: string | null;
  description?: string | null;
  category?: Category | null;
};