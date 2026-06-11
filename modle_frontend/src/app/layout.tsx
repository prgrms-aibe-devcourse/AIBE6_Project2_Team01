import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modle",
  description: "모델과 의뢰인을 잇는 매칭 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
