import "./globals.css";

export const metadata = {
  title: "Groupspace",
  description: "A collaborative platform for students to manage group projects, share resources, and communicate effectively.",
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
