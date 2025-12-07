import { Route, Routes } from "react-router-dom";
import type { RoutesConfig } from "./models/routes";
import { Suspense } from "react";
import { Spinner } from "@radix-ui/themes";
import { routes } from "./config/routes";

function renderRoutes(routesConfig: RoutesConfig[]) {
    return routesConfig.map(({ path, element, children }, index) => (
        <Route key={path + index} path={path} element={
            <Suspense fallback={<Spinner />}>
                {element}
            </Suspense>
        }>
            {children && renderRoutes(children)}
        </Route>
    ));
}

export default function AppRouter() {
    return (
        <Routes>
            {renderRoutes(routes)};
        </Routes>
    );
}