import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const alphaLyrae = localFont({
  src: "./fonts/AlphaLyrae-Medium.woff",
  variable: "--font-alpha-lyrae",
});

export const metadata: Metadata = {
  title: "Qwen-2.5 Coder - Code Interpreter",
  description: "Qwen-2.5 Coder - Code Interpreter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${alphaLyrae.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
