import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import AuthProviders from "./providers/AuthProviders";
import { Toaster } from 'sonner';

const robotoSans = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkyhubERP - Modern ERP System",
  description: "Complete business management solution for modern enterprises",
  keywords: ['ERP', 'Accounting', 'Inventory', 'Business Management']
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${robotoSans.variable} ${robotoMono.variable} antialiased`}
      >
        <AuthProviders>
          <Toaster />
          {children}
        </AuthProviders>
      </body>
    </html>
  );
}
