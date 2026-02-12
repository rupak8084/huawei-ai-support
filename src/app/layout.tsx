import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Customer Service Agent - Intelligent Support",
  description: "AI-powered customer service agent with real-time data access. Deploy on your server for enhanced customer support with intelligent responses, order tracking, and instant assistance.",
  keywords: ["AI Customer Service", "Customer Support", "AI Agent", "Real-time Support", "Chatbot", "E-commerce Support", "Self-hosted AI"],
  authors: [{ name: "AI Customer Service Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "AI Customer Service Agent",
    description: "Intelligent AI-powered customer service with real-time data access",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Customer Service Agent",
    description: "Intelligent AI-powered customer service with real-time data access",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
