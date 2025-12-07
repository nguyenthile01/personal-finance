import { lazy } from "react";
import { Navigate } from "react-router-dom";
import type { RoutesConfig } from "../models/routes";
import { NotFoundError } from "../app/errors/not-found/not-found-error";

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
        element: <DashboardPage />
    },
    {
        path: "/revenue",
        element: <RevenuePage />
    },
    {
        path: "/expenses",
        element: <ExpensesPage />
    },
    {
        path: "*",
        element: <NotFoundError />
    }
];
