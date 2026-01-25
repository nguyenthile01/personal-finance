import type { RootState } from "@/store";
import { Suspense } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { loading } = useSelector((state: RootState) => state.auth);
    const authData = localStorage.getItem("sb-vmtthgtnabastdkktcol-auth-token");
    const user = authData ? JSON.parse(authData).user : null;
    if (loading) {
        return <Suspense fallback={<div>Loading...</div>}></Suspense>;
    }

    if (!user) {
        return <Navigate to="/sign-in" replace />;
    }

    return <>{children}</>;
}