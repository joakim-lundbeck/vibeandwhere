"use client"

import { useLanguage } from "@/contexts/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { useScroll } from "@/hooks/use-scroll"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
  const { t } = useLanguage()
  const scrolled = useScroll(50)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50">
      <div
        className={`transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-transparent"}`}
      >
        <div className="container mx-auto py-2 px-4">
          <div className="flex justify-end items-center">
            <div className="flex gap-2 sm:gap-4 items-center">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
