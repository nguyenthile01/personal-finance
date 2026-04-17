import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/store";

import { signIn } from "@/store/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/language";
import { getProfile } from "@/store/profile";
import i18n from "i18next";

export default function SignIn() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const dispatch = useAppDispatch();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lng", lng); // optional: persist user choice
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(signIn({ email, password })).unwrap();
      const profile = await dispatch(getProfile(result.id)).unwrap();
      changeLanguage(profile.country?.code || "en"); // set language based on user's country
      localStorage.setItem("user", JSON.stringify({ email }));
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      setErrorMessages([message]);
    }
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <LanguageSwitcher />
      <h1 className="text-2xl mb-4">{t("auth.sign_in")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Label className="block">
          <span className="text-sm">{t("auth.email")}</span>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </Label>

        <Label className="block">
          <span className="text-sm">{t("auth.password")}</span>
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </Label>

        <div className="text-sm text-right">
          <a href="#" className="text-blue-600 hover:underline">{t("auth.forgot_password")}</a>
        </div>

        <Button type="submit" className="w-full py-2 rounded">{t("auth.sign_in_btn")}</Button>
        <Button variant="outline" className="w-full py-2 rounded" onClick={() => navigate('/sign-up')}>{t("auth.sign_up_btn")}</Button>
      </form>
      {errorMessages.length > 0 && (
        <p className="mt-4 text-red-600">
          {t("auth.sign_in_failed")}
        </p>
      )}
    </main>
  );
}