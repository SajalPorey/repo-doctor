import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && (window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/_not-found.html') || window.location.pathname.endsWith('/404.html'))) {
                window.history.replaceState(null, '', '/' + window.location.search);
              }
            `
          }}
        />
      </head>
      <body className="bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
