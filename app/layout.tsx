import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OS Algorithm Visualizer",
  description: "Interactive step-by-step visualizations of core OS algorithms — CPU scheduling, deadlock avoidance, and page replacement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
