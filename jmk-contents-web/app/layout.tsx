import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdSenseHead } from "@/components/ads/AdSenseScript";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SITE_URL } from "@/lib/site";
import { SiteShell } from "@/components/SiteShell";
import { SiteSidebar } from "@/components/SiteSidebar";
import { getSidebarGroups, getSiteExams } from "@/lib/site-menu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "JMK Contents - 자격증 필기 공부방",
  description: "자격증 필기 예상문제와 해설, 단원별 핵심요약, 시험 정보를 종목별로 모은 공부 사이트",
};

export const revalidate = 3600;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [groups, exams] = await Promise.all([getSidebarGroups(), getSiteExams()]);
  const sidebar = (
    <SiteSidebar
      groups={groups}
      examCount={exams.length}
      questionCount={exams.reduce((sum, exam) => sum + exam.questionCount, 0)}
      conceptCount={exams.reduce((sum, exam) => sum + exam.conceptCount, 0)}
    />
  );

  return (
    <html lang="ko">
      <head>
        <AdSenseHead />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Header />
        <SiteShell sidebar={sidebar}>{children}</SiteShell>
        <GoogleAnalytics />
        <Footer />
      </body>
    </html>
  );
}
