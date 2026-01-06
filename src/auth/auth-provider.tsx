
import { AppConstant } from "@/interfaces/app-common";
import supabase from "@/lib/supabase";
import { useAppDispatch } from "@/store";
import { signOut } from "@/store/auth";
import { useEffect } from "react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  console.log("AuthProvider rendering");

  useEffect(() => {
  const { data } = supabase.auth.onAuthStateChange((event) => {
    console.log("event", event);
    if (event === AppConstant.DATA.AUTH_STATE.PASSWORD_RECOVERY || event === AppConstant.DATA.AUTH_STATE.TOKEN_REFRESHED || event === AppConstant.DATA.AUTH_STATE.SIGNED_OUT) {
      dispatch(signOut());
      localStorage.clear();
    }
  });

  return () => {
    data.subscription.unsubscribe();
  };
}, [dispatch]);


  return children;
}