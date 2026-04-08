"use client"
import LanguageSwitcher from "@/components/language";
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

export function NotFoundError() {
  const { t } = useTranslation();
  const navigate = useNavigate()

  return (
    <>
      <LanguageSwitcher />
      <div className='mx-auto flex min-h-dvh flex-col items-center justify-center gap-8 p-8 md:gap-12 md:p-16'>
        <div className='text-center'>
          <h1 className='mb-4 text-3xl font-bold'>404</h1>
          <h2 className="mb-3 text-2xl font-semibold">{t("not_found_error.title")}</h2>
          <p>{t("not_found_error.description")}</p>
          <div className='mt-6 flex items-center justify-center gap-4 md:mt-8'>
            <Button className='cursor-pointer' onClick={() => navigate('/dashboard')}>{t("not_found_error.button_back")}</Button>
            <Button variant='outline' className='flex cursor-pointer items-center gap-1' onClick={() => navigate('#')}>
              {t("not_found_error.button_contact")}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
