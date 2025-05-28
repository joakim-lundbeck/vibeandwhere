"use client"
import EventPlannerForm from "@/components/event-planner-form"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="gradient-bg min-h-screen">
      <main className="container mx-auto px-4">
        <div className="flex justify-center items-center" style={{ minHeight: 0, marginBottom: 4, marginTop: 0 }}>
          <img
            src="/logo.png"
            alt="When & Where logotype"
            style={{ maxWidth: 320, width: "100%", display: "block" }}
          />
        </div>
        <div className="max-w-2xl mx-auto text-center mb-6">
          <p className="text-lg sm:text-xl text-teal/80 max-w-2xl mx-auto font-light mb-4" style={{ marginTop: 0 }}>{t("description")}</p>
        </div>
        <div className="max-w-2xl mx-auto" id="event-planner-form">
          <EventPlannerForm />
        </div>
      </main>
    </div>
  )
}
