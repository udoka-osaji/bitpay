"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Check if current path is dashboard or pitch page (no header/footer)
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isPitchPage = pathname.startsWith('/pitch');

  if (isDashboardPage || isPitchPage) {
    // Dashboard and pitch pages: no header/footer, just children
    return <>{children}</>;
  }

  // Regular pages: show header and footer
  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}