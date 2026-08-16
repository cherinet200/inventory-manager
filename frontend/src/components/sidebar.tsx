import { useNavigate } from "@tanstack/react-router";
import Logo from "../assets/inventory.png";
import {
    LayoutDashboard,
    Box,
    BadgeDollarSign,
    LogOut,
    ChevronsUpDown,
} from "lucide-react";
import { useAuth } from "../contexts/auth";
import { useState } from "react";

type SidebarProps = {
    currentPath: string;
};

function Sidebar({ currentPath }: SidebarProps) {
    const [showUserActions, setShowUserActions] = useState<"block" | "hidden">(
        "hidden",
    );
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { user } = useAuth();

    const name = user?.name ?? "Guest";
    const email = user?.email ?? "";

    const sidebar = [
        {
            icon: <LayoutDashboard />,
            name: "Dashboard",
            link: "/dashboard",
            isActive: currentPath.startsWith("/dashboard"),
        },
        {
            icon: <Box />,
            name: "Inventory",
            link: "/inventory",
            isActive: currentPath.startsWith("/inventory"),
        },
        {
            icon: <BadgeDollarSign />,
            name: "Sales",
            link: "/sales",
            isActive: currentPath.startsWith("/sales"),
        },
    ];

    return (
        <div className="flex flex-col w-full items-center mt-4 gap-10">
            <div className="flex items-center w-full px-9 py-4">
                <img src={Logo} alt="Logo" width="70" height="79" />
                <h2 className="font-playfair text-2xl text-blue-500 dark:text-blue-600 font-bold">
                    INVENTORY
                </h2>
            </div>

            <ul className="mt-1 w-full select-none">
                {sidebar.map((item) => (
                    <li
                        key={item.link}
                        className={`flex items-center gap-4 text-2xl px-10 py-4 hover:bg-red-900 dark:hover:bg-gray-900 cursor-pointer transition-all duration-600 ease-out hover:transform hover:scale-110 ${item.isActive ? "text-blue-500 dark:text-blue-600" : "text-gray-500"}`}
                        onClick={() => {
                            navigate({ to: item.link });
                        }}
                    >
                        {item.icon}
                        {item.name}
                    </li>
                ))}
            </ul>

            <div className="flex flex-col mt-auto mb-0.5 py-2 text-center rounded-lg shadow-2xl border border-gray-100 dark:border-gray-900">
                <div className="flex items-center justify-between px-4 gap-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center text-gray-300 bg-blue-600/80 h-13 w-13 rounded-[100%] font-semibold text-center">
                            CB
                        </div>
                        <div className="flex flex-col">
                            <div className="text-lg font-semibold text-gray-400 leading-none">
                                {name}
                            </div>
                            <div className="text-sm text-gray-500">{email}</div>
                        </div>
                    </div>
                    <ChevronsUpDown
                        className="text-gray-400 cursor-pointer"
                        onClick={() => {
                            showUserActions === "hidden"
                                ? setShowUserActions("block")
                                : setShowUserActions("hidden");
                        }}
                    />
                </div>

                <div
                    className={`fixed bg-black/60 text-gray-400 py-1 left-65 top-255 rounded-lg ${showUserActions}`}
                >
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-red-700 focus:outline-none self-center px-6 py-2"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
