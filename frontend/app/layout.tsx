import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shivansh Srivastava | Portfolio",
  description: "AI Engineer & Full-Stack Developer portfolio platform."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
