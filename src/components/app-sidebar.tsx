import { routes } from "@/config/routes";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { ChevronRight, Command } from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

export default function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader />

            <SidebarGroup>
                <SidebarGroupLabel>
                    <Command size={16} />
                    Personal Finance
                </SidebarGroupLabel>

                <SidebarGroupContent className="overflow-y-auto max-h-[calc(100vh-2rem)]">
                    <SidebarMenu>
                        {routes.map(
                            (route) =>
                                route.name && (
                                    <SidebarMenuItem key={route.path}>
                                        {route.children ? (
                                            /* COLLAPSIBLE PARENT */
                                            <Collapsible>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton>
                                                        {route.icon && (
                                                            <route.icon className="size-4 shrink-0" />
                                                        )}
                                                        <span>{route.name}</span>
                                                        <ChevronRight className="ml-auto size-4 transition-transform data-[state=open]:rotate-90" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent>
                                                    <SidebarMenu className="pl-6">
                                                        {route.children.map(
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
                                            <SidebarMenuButton asChild>
                                                <Link to={route.path}>
                                                    {route.icon && (
                                                        <route.icon className="size-4 shrink-0" />
                                                    )}
                                                    <span>{route.name}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        )}
                                    </SidebarMenuItem>
                                )
                        )}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

            <SidebarFooter />
        </Sidebar>
    )
}