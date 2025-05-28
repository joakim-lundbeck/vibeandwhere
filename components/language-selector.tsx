"use client"
import { useLanguage } from "@/contexts/language-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <Select value={language} onValueChange={(value: "en" | "sv") => setLanguage(value)}>
      <SelectTrigger className="w-[130px] rounded-full border-sky/30 bg-white/80 text-teal">
        <SelectValue>
          <div className="flex items-center gap-2">
            {language === "en" ? (
              <>
                <UKFlag className="h-4 w-auto" />
                <span>English</span>
              </>
            ) : (
              <>
                <SwedenFlag className="h-4 w-auto" />
                <span>Svenska</span>
              </>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-xl border-sky/30">
        <SelectItem value="en" className="rounded-lg my-1 focus:bg-sky/10">
          <div className="flex items-center gap-2">
            <UKFlag className="h-4 w-auto" />
            <span>English</span>
          </div>
        </SelectItem>
        <SelectItem value="sv" className="rounded-lg my-1 focus:bg-sky/10">
          <div className="flex items-center gap-2">
            <SwedenFlag className="h-4 w-auto" />
            <span>Svenska</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

function UKFlag({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={className}>
      <clipPath id="a">
        <path d="M0 0v30h60V0z" />
      </clipPath>
      <clipPath id="b">
        <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
      </clipPath>
      <g clipPath="url(#a)">
        <path d="M0 0v30h60V0z" fill="#012169" />
        <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
        <path d="M0 0l60 30m0-30L0 30" clipPath="url(#b)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  )
}

function SwedenFlag({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10" className={className}>
      <rect width="16" height="10" fill="#006AA7" />
      <rect x="5" width="2" height="10" fill="#FECC00" />
      <rect y="4" width="16" height="2" fill="#FECC00" />
    </svg>
  )
}
