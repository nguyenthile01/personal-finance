import { routes } from "@/config/routes";
import { Sidebar, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { ChevronRight, Command } from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

export default function AppSidebar() {
    return (
        <Sidebar>
            <SidebarGroup>
                <SidebarGroupLabel>
                    <Command size={16} />
                    Personal Finance
                </SidebarGroupLabel>
                <SidebarGroupContent className="overflow-y-auto max-h-[calc(100vh-2rem)]">
                    <SidebarMenu>
                        {routes.map((route) => {
                            if (route.layout === "main" && route.children && route.children.length > 0) {
                                return route.children.map((childRoute) => (
                                    <SidebarMenuItem key={childRoute.path}>
                                        {childRoute.children ? (
                                            /* COLLAPSIBLE PARENT */
                                            <Collapsible>

                                                <CollapsibleContent>
                                                    <SidebarMenu className="pl-6">
                                                        {childRoute.children.map(
                                                            (child) =>
                                                                child.name && (
                                                                    <SidebarMenuItem key={child.path}>
                                                                        <SidebarMenuButton asChild>
                                                                            <Link to={child.path}>
                                                                                {child.icon && (
                                                                                    <child.icon className="size-4" />
                                                                                )}
                                                                                <span>{child.name}</span>
                                                                            </Link>
                                                                        </SidebarMenuButton>
                                                                    </SidebarMenuItem>
                                                                )
                                                        )}
                                                    </SidebarMenu>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        ) : (
                                            /* NORMAL ITEM */
                                            childRoute.name && (
                                                <SidebarMenuButton asChild>
                                                    <Link to={childRoute.path}>
                                                        {childRoute.icon && (
                                                            <childRoute.icon className="size-4 shrink-0" />
                                                        )}
                                                        <span>{childRoute.name}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            )
                                        )}
                                    </SidebarMenuItem>
                                ));
                            }
                            return null;
                        })}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarFooter />
        </Sidebar>
    )
}