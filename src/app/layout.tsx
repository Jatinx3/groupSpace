import "./globals.css";
import { ThemeProvider } from "../components/providers/ThemeProvider";
import CookieBanner from "../components/layout/CookieBanner";

export const metadata = {
  title: "Groupspace",
  description: "A collaborative platform for students to manage group projects, share resources, and communicate effectively.",
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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
