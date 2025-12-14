import { BrowserRouter as Router } from "react-router-dom"
import AppRouter from "./app-router"
import AppSidebar from "./components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";

const basename = import.meta.env.VITE_BASENAME || '';

export default function App() {
  return (
    <div
      className="font-sans antialiased flex min-h-screen"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <SidebarProvider>
        <Router basename={basename}>
          {/* Sidebar */}
          <AppSidebar />

          {/* Main content */}
          <main className="flex-1">
            <SidebarTrigger />
            <AppRouter />
          </main>
        </Router>
      </SidebarProvider>
    </div>
  )
}
