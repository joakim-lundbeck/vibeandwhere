"use client"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "sv" : "en")}
      className="text-teal hover:bg-sky/10 rounded-full"
    >
      {language === "en" ? t("switchToSwedish") : t("switchToEnglish")}
    </Button>
  )
}
