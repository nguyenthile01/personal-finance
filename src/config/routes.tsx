import { lazy } from "react";
import { NotFoundError } from "../app/errors/not-found/not-found-error";
import type { RoutesConfig } from "../interfaces/routes";
import { BanknoteArrowDown, BanknoteArrowUp, Dock, LayoutDashboard } from "lucide-react";
import LoginPage from "@/app/sign-in/page";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "../auth/protect-route";
import ProfilePage from "@/app/profile/page";

const DashboardPage = lazy(() => import("../app/dashboard/page"));
const RevenuePage = lazy(() => import("../app/revenue/page"));
const ExpensesPage = lazy(() => import("../app/expenses/page"));
const MainLayout = lazy(() => import("../components/layouts/main-layout"));
const SignUpPage = lazy(() => import("../app/sign-up/page"));
const CategoryPage = lazy(() => import("../app/category/page"));

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
                name: "dashboard.title",
                icon: LayoutDashboard
            },
            {
                path: "/revenue",
                element: <RevenuePage />,
                name: "revenue.title",
                icon: BanknoteArrowUp
            },
            {
                path: "/expenses",
                element: <ExpensesPage />,
                name: "expense.title",
                icon: BanknoteArrowDown
            },
            {
                path: "/category",
                element: <CategoryPage />,
                name: "category.title",
                icon: Dock
            },
            {
                path: "/profile",
                element: <ProfilePage />
            }
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
