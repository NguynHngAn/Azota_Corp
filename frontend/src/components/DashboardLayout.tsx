import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import type React from "react";

interface DashboardLayoutProps {
  /**
   * Backward-compatible props for the legacy router layout usage.
   * The current layout (sidebar/topbar) doesn't need these, but older routes pass them.
   */
  title?: string;
  navLinks?: { to: string; label: string }[];
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
