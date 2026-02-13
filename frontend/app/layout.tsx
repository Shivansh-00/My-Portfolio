import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shivansh'Portfolio",
  description:
    "AI Engineer & Full-Stack Developer — An immersive gaming-style portfolio built with Next.js and Three.js.",
  keywords: [
    "Shivansh Srivastava", 
    "portfolio",
    "AI Engineer",
    "Full-Stack Developer",
    "Three.js",
    "gaming portfolio",
  ],
  openGraph: {
    title: "Shivansh'Portfolio",
    description:
      "AI Engineer & Full-Stack Developer — An immersive gaming-style portfolio.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="noise-bg">{children}</body>
    </html>
  );
}
