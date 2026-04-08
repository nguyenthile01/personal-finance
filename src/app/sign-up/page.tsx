import LanguageSwitcher from "@/components/language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Profile } from "@/interfaces/profile";
import { cn } from "@/lib/utils";
import { useAppDispatch, type RootState } from "@/store";
import { signUp } from "@/store/auth";
import { getCountries } from "@/store/country";
import { addProfile } from "@/store/profile";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useAppDispatch();
  const { data: countries } = useSelector((state: RootState) => state.country);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [country, setCountry] = useState("");
  useEffect(() => {
    dispatch(getCountries());
  }, [dispatch]);

  const createNewProfile = async (user: User) => {
    const profile: Profile = {
      id: user.id,
      email: user.email!,
      last_name: lastName,
      first_name: firstName,
      phone_number: "",
      profile_picture: "",
      country_id: country
    }
    await dispatch(addProfile(profile)).unwrap();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: replace with real auth call
      if (!isEmailValid(email))
        return;
      if (!isPasswordValid(password))
        return;
      if (!doPasswordsMatch(password, confirmPassword))
        return;
      const newUser = await dispatch(signUp({ email, password })).unwrap();
      await createNewProfile(newUser!);
      navigate("/sign-in");
    } catch (error) {
      console.error("Error during sign up:", error);
    }
  };

  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordValid = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
    return passwordRegex.test(password);
  };

  const doPasswordsMatch = (password: string, confirmPassword: string) => {
    return password === confirmPassword;
  };

  return (
    <main className="max-w-md mx-auto p-6">
      <LanguageSwitcher />
      <h1 className="text-2xl mb-4">{t("auth.sign_up")}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Label htmlFor="lastName" className="text-sm block">{t("auth.last_name")}<sup className="text-rose-600">*</sup></Label>
        <Input
          id="lastName"
          type="text"
          value={lastName}
          required
          onChange={e => setLastName(e.target.value)}
          className={cn("mt-1 block w-full rounded border px-3 py-2")}
        />
        <Label htmlFor="firstName" className="text-sm block">{t("auth.first_name")}<sup className="text-rose-600">*</sup></Label>
        <Input
          id="firstName"
          type="text"
          value={firstName}
          required
          onChange={e => setFirstName(e.target.value)}
          className={cn("mt-1 block w-full rounded border px-3 py-2")}
        />
        <Label htmlFor="email" className="text-sm block">{t("auth.email")}<sup className="text-rose-600">*</sup></Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={cn("mt-1 block w-full rounded border px-3 py-2", {
            "border-red-500": !isEmailValid(email) && email.trim().length > 0
          })}
        />

        <Label htmlFor="password" className="text-sm block">{t("auth.password")}<sup className="text-rose-600">*</sup></Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className={cn("mt-1 block w-full rounded border px-3 py-2", {
            "border-red-500": !isPasswordValid(password) && password.length > 0
          })}
        />

        <Label htmlFor="confirmPassword" className="text-sm block">{t("auth.confirm_password")}</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          className={cn("mt-1 block w-full rounded border px-3 py-2", {
            "border-red-500": !doPasswordsMatch(password, confirmPassword) && confirmPassword.length > 0
          })}
        />
        <Label htmlFor="country" className="text-sm block">{t("auth.country")}<sup className="text-rose-600">*</sup></Label>
        <Select name="country" required onValueChange={(value) => setCountry(value)}>
          <SelectTrigger className="w-100">
            <SelectValue placeholder={t("auth.country_select_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {countries?.map((c) => (
              <SelectItem key={c.id} value={(c.id).toString()} >
                {t(`country.${c.code}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" className="w-full py-2 rounded">{t("auth.sign_up_btn")}</Button>
      </form>
      <div>
        {!isEmailValid(email) && email.length > 0 && (
          <p className="mt-2 text-xs text-red-500">
            {t("auth.invalid_email")}
          </p>
        )}
        {!isPasswordValid(password) && password.length > 0 && (
          <>
            <p className="mt-2 text-xs text-red-500">
              {t("auth.invalid_password")}
            </p>
            <ul className="text-xs list-disc list-inside">
              <li>{t("auth.password_limit_character")}</li>
              <li>{t("auth.password_limit_uppercase")}</li>
              <li>{t("auth.password_limit_lowercase")}</li>
              <li>{t("auth.password_limit_numer")}</li>
              <li>{t("auth.password_limit_special_character")}</li>
            </ul>
          </>
        )}
        {!doPasswordsMatch(password, confirmPassword) && confirmPassword.length > 0 && (
          <p className="mt-2 text-xs text-red-500">
            {t("auth.invalid_password_confirm")}
          </p>
        )}
      </div>
      <div className="mt-4 text-sm">
        {t("auth.is_account_existing")}{" "}
        <a href="/sign-in" className="text-blue-500 hover:underline">
          {t("auth.sign_in_btn")}
        </a>
      </div>
    </main>
  );
}