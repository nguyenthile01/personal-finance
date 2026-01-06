import { useRoutes } from "react-router-dom"
import { routes } from "./config/routes";
import { Suspense } from "react";

export default function App() {
  const element = useRoutes(routes);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {element}
    </Suspense>
  );
}
