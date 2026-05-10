import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnePad Parent App",
  description: "Backend-powered parent app for OnePad School AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
