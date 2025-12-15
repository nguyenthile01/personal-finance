import { Outlet, BrowserRouter as Router } from "react-router-dom";
import AppSidebar from "../app-sidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";

export default function MainLayout() {
  return (
    <div
      className="font-sans antialiased flex min-h-screen"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <SidebarProvider>
        {/* Sidebar */}
        <AppSidebar />
        {/* Main content */}
        <main className="flex-1">
          <SidebarTrigger />
          {/* render nested route element(s) from the root BrowserRouter */}
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}