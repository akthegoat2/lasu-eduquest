import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LASU Learn - Computer Science E-Learning Platform",
  description: "Interactive learning platform for Computer Science students at Lagos State University",
  keywords: ["e-learning", "computer science", "LASU", "education", "programming", "web development"],
  authors: [{ name: "LASU Computer Science Department" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
  openGraph: {
    title: "LASU Learn - Computer Science E-Learning Platform",
    description: "Interactive learning platform for Computer Science students at Lagos State University",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "LASU Learn - Computer Science E-Learning Platform",
    description: "Interactive learning platform for Computer Science students at Lagos State University",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
