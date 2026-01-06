import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";
import { CircleUserRound } from "lucide-react";
import { useAppDispatch, type RootState } from "@/store";
import { signOut } from "@/store/auth";
import { useSelector } from "react-redux";

export function Header() {
    const dispatch = useAppDispatch();
    const {data: user} = useSelector((state: RootState) => state.auth);
    return (
        <header className="flex items-center justify-space-around">
            {/* Breadcrumb */}
            {/* User Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <CircleUserRound size={30} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 backdrop-blur-md bg-white/30 border border-gray-200 shadow-md">
                    <DropdownMenuItem disabled>
                        {user?.email || "Unknown User"}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => dispatch(signOut())}>
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
