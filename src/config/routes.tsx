import { lazy } from "react";
import { NotFoundError } from "../app/errors/not-found/not-found-error";
import type { RoutesConfig } from "../interfaces/routes";
import { BanknoteArrowUp, LayoutDashboard } from "lucide-react";
import LoginPage from "@/app/sign-in/page";
import { Navigate } from "react-router-dom";

const DashboardPage = lazy(() => import("../app/dashboard/page"));
const RevenuePage = lazy(() => import("../app/revenue/page"));
const ExpensesPage = lazy(() => import("../app/expenses/page"));
const MainLayout = lazy(() => import("../components/layouts/main-layout"));
const ProtectedRoute = lazy(() => import("../auth/protect-route"));
const SignUpPage = lazy(() => import("../app/sign-up/page"));

export const routes: RoutesConfig[] = [
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        ),
        layout: "main",
        children: [
            {
                path: "/",
                element: <Navigate to="/dashboard" replace />
            },
            {
                path: "/dashboard",
                element: <DashboardPage />,
                name: "Dashboard",
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
    { path: "/sign-in", element: <LoginPage />, layout: "none" },
    { path: "/sign-up", element: <SignUpPage />, layout: "none" },
    {
        path: "*",
        element: <NotFoundError />,
        layout: "none"
    }
];
