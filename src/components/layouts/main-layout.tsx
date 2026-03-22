import { Outlet, BrowserRouter as Router } from "react-router-dom";
import AppSidebar from "../app-sidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { Header } from "../header";

export default function MainLayout() {
  return (
    <div
      className="font-sans antialiased flex max-h-screen p-2"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <SidebarProvider>
        {/* Sidebar */}
        <AppSidebar />
        {/* Main content */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <SidebarTrigger />
            <Header />
          </div>
          
          {/* render nested route element(s) from the root BrowserRouter */}
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}