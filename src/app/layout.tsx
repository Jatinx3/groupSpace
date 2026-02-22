import "./globals.css";

export const metadata = {
  title: "Groupspace",
  description: "University Project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
