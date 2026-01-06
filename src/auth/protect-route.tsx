import type { RootState } from "@/store";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { loading } = useSelector((state: RootState) => state.auth);
    const authData = localStorage.getItem("sb-vmtthgtnabastdkktcol-auth-token");
    const parsed = JSON.parse(authData!); // parse JSON
    const token = parsed?.access_token ?? null;
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!token) {
        return <Navigate to="/sign-in" replace />;
    }

    return <>{children}</>;
}