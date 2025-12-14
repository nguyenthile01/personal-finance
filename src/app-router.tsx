import { Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import { Spinner } from "@radix-ui/themes";
import { routes } from "./config/routes";
import type { RoutesConfig } from "./interfaces/routes";

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