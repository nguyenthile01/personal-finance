import type { Category } from "./category";

export type Revenue = {
  id: string;
  amount: number;
  category_id: number,
  revenue_date: string;
  user_id: string | null;
  description?: string | null;
  category?: Category | null;
};