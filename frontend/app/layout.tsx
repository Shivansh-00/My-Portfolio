import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shivansh | Dark Knight Portfolio",
  description:
    "AI Engineer & Full-Stack Developer — A cinematic Batman-themed portfolio built with Next.js, Three.js, and Framer Motion.",
  keywords: [
    "Shivansh Srivastava", 
    "portfolio",
    "AI Engineer",
    "Full-Stack Developer",
    "Three.js",
    "Batman portfolio",
    "Dark Knight",
  ],
  openGraph: {
    title: "Shivansh | Dark Knight Portfolio",
    description:
      "AI Engineer & Full-Stack Developer — A cinematic Batman-themed portfolio experience.",
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
