import "./globals.css";
import { ThemeProvider } from "../components/providers/ThemeProvider";
import { PHProvider } from "../components/providers/PostHogProvider";
import { ProfileProvider } from "../components/providers/ProfileProvider";
import CookieBanner from "../components/layout/CookieBanner";

export const metadata = {
  title: "Collably",
  description: "A collaborative platform for students and supervisors to manage group projects, thesis workflows, and communicate effectively.",
};

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <PHProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <ProfileProvider>
              {children}
              <CookieBanner />
            </ProfileProvider>
          </ThemeProvider>
        </PHProvider>
      </body>
    </html>
  );
}

