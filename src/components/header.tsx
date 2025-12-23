import { useAuth } from "@/contexts/auth-context";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { CircleUserRound } from "lucide-react";
import { Breadcrumb } from "./ui/breadcrumb";

export function Header() {
    const { user, signOut } = useAuth();
    return (
        <header className="flex items-center justify-space-around">
            {/* Breadcrumb */}
            {/* User Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <CircleUserRound className="size-8" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 backdrop-blur-md bg-white/30 border border-gray-200 shadow-md">
                    <DropdownMenuItem disabled>
                        {user?.email || "Unknown User"}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => signOut()}>
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
