
import supabase from "@/lib/supabase";
import { useAppDispatch } from "@/store";
import { getUser, signOut } from "@/store/auth";
import { useEffect } from "react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const authData = localStorage.getItem("sb-vmtthgtnabastdkktcol-auth-token");
  const user = authData ? JSON.parse(authData).user : null;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case 'SIGNED_IN':
        case 'INITIAL_SESSION':
          if (session?.user && !user) {
            dispatch(getUser());
          }
          break;
        case 'SIGNED_OUT':
          if (!session) {
            dispatch(signOut());
          }
          break;

        case 'TOKEN_REFRESHED':
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch, user]);


  return children;
}