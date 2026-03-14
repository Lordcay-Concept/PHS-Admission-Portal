import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from 'next/image';
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
  ),
  title: "Possible Height Schools | Excellence in Education",
  description: "Official portal for Possible Height Schools. Empowering the leaders of tomorrow.",
  keywords: [
    "Possible Height Schools", 
    "School Admission Portal", 
    "Best Schools in Nigeria", 
    "Quality Education", 
    "Private Schools", 
    "Nursery and Primary School",
    "Secondary School Education"
  ],
  icons: {
    icon: "/images/web/PHS_Logo.jpg", 
    shortcut: "/images/web/PHS_Logo.jpg",
    apple: "/images/web/PHS_Logo.jpg",
  },
  openGraph: {
    title: "Possible Height Schools Admission",
    description: "Join a community of excellence. Register your child at Possible Height Schools.",
    url: "https://your-school-domain.com", 
    siteName: "Possible Height Schools",
    images: [
      {
        url: "/images/logo/PHS%20Logo.webp", 
        width: 800,
        height: 600,
        alt: "Possible Height Schools Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Possible Height Schools",
    description: "Empowering the leaders of tomorrow. Apply for admission today.",
    images: ["/images/logo/PHS%20Logo.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Toaster position="top-center" richColors /> 
      </body>
    </html>
  );
}