export interface RoutesConfig { 
    path: string;
    element: React.ReactNode;
    children?: RoutesConfig[];
}