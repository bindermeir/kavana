import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "כוונה - תפילה אישית",
  description: "אפליקציה ליצירת תפילות אישיות בהתאמה אישית",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "כוונה"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}


