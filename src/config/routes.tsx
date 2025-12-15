import { lazy } from "react";
import { NotFoundError } from "../app/errors/not-found/not-found-error";
import type { RoutesConfig } from "../interfaces/routes";
import { BanknoteArrowUp, LayoutDashboard } from "lucide-react";
import LoginPage from "@/app/login/page";

const DashboardPage = lazy(() => import("../app/dashboard/page"));
const RevenuePage = lazy(() => import("../app/revenue/page"));
const ExpensesPage = lazy(() => import("../app/expenses/page"));
const MainLayout = lazy(() => import("../components/layouts/main-layout"));

export const routes: RoutesConfig[] = [
    {
        path: "/",
        element: <MainLayout />,
        layout: "main",
        children: [
            {
                path: "/dashboard",
                element: <DashboardPage />,
                name: "Dashboard",
                icon: LayoutDashboard,
                layout: "main"
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
        ]
    },
    { path: "/login", element: <LoginPage />, layout: "none" },
    {
        path: "*",
        element: <NotFoundError />,
        layout: "none"
    }
];
