import type { ComponentType, SVGProps } from "react";

export interface RoutesConfig { 
    path: string;
    element: React.ReactNode;
    children?: RoutesConfig[];
    name?: string | null;
    icon?: ComponentType<SVGProps<SVGSVGElement>>| null;
    layout?: string | null;
}