"use client"
import { motion, useTransform, useScroll } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  className?: string
}

export function Logo({ className = "" }: LogoProps) {
  const { language } = useLanguage()
  const { scrollY } = useScroll()

  // Transform values based on scroll position
  const scale = useTransform(scrollY, [0, 100], [1, 0.5])
  const opacity = useTransform(scrollY, [0, 100], [1, 0])
  const y = useTransform(scrollY, [0, 100], [0, -30])

  return (
    <motion.div
      className={`w-full max-w-2xl mx-auto ${className}`}
      style={{ scale, opacity, y }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Link href="/">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20May%2019%2C%202025%2C%2007_54_27%20PM-4MHOXqOIQAgj1xS6ce4P7GFRMfRLma.png"
          alt={language === "en" ? "When and Where logo" : "När och Var logotyp"}
          width={800}
          height={266}
          className="w-full h-auto object-contain"
          priority
        />
      </Link>
    </motion.div>
  )
}
