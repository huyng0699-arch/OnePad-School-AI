import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "OnePad Parent App", description: "OnePad School AI separate role app" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
