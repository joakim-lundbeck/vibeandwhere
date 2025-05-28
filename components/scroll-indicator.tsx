"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import { ChevronDown } from "lucide-react"

export function ScrollIndicator() {
  const { t } = useLanguage()

  const scrollToForm = () => {
    const formElement = document.getElementById("event-planner-form")
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <motion.div
      className="flex flex-col items-center cursor-pointer mb-1"
      onClick={scrollToForm}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <motion.p
        className="text-teal/80 mb-0 text-sm"
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
      >
        {t("scrollToStart")}
      </motion.p>
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
      >
        <ChevronDown className="h-5 w-5 text-teal/60" />
      </motion.div>
    </motion.div>
  )
}
