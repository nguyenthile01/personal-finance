import { useAuth } from "@/contexts/auth-context";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({children}: {children: React.ReactNode}) {
    const {isAuthenticated, loading} = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/sign-in" replace  />;
    }

    return <>{children}</>;
}