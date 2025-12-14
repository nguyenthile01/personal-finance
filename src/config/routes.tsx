import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { NotFoundError } from "../app/errors/not-found/not-found-error";
import type { RoutesConfig } from "../interfaces/routes";
import { BanknoteArrowUp, LayoutDashboard } from "lucide-react";

const DashboardPage = lazy(() => import("../app/dashboard/page"));
const RevenuePage = lazy(() => import("../app/revenue/page"));
const ExpensesPage = lazy(() => import("../app/expenses/page"));

export const routes: RoutesConfig[] = [
    {
        path: "/",
        element: <Navigate to="/dashboard" replace />
    },
    {
        path: "/dashboard",
        element: <DashboardPage />,
        name: "Dashboard",
        icon: LayoutDashboard
    },
    {
        path: "/revenue",
        element: <RevenuePage />,
        name: "Revenue",
        icon: BanknoteArrowUp
    },
    {
        path: "/expenses",
        element: <ExpensesPage />,
        name: "Expenses",
        icon: BanknoteArrowUp
    },
    {
        path: "*",
        element: <NotFoundError />
    }
];
