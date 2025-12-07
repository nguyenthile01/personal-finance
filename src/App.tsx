import { BrowserRouter as Router } from "react-router-dom"
import { Theme } from "@radix-ui/themes"
import AppRouter from "./app-router"

export default function App() {
  return (
    <div className="font-sans antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
      <Theme>
        <Router>
          <AppRouter />
        </Router>
      </Theme>
    </div>
  )
}
