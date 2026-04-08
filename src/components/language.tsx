import { useEffect } from "react";
import i18n from "i18next";
import { useAppDispatch, type RootState } from "@/store";
import { getCountries } from "@/store/country";
import { useSelector } from "react-redux";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const { data: countries } = useSelector((state: RootState) => state.country);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getCountries());
  }, [dispatch]);
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lng", lng); // optional: persist user choice
  };
  return (
    <div className="flex flex-row-reverse m-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Globe size={30} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 backdrop-blur-md bg-white/30 border border-gray-200 shadow-md">
          {countries?.map((c) => (
            <DropdownMenuItem key={`${c.code}_${c.name}`} onClick={() => changeLanguage(c.code)}>
              {t(c.code)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}