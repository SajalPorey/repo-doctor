import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoDoctor",
  description: "GitHub repository health checker and upgrade assistant"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
