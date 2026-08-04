import { useNavigate } from "@tanstack/react-router";
import Logo from "../assets/inventory.png";
import { House, Box, Receipt, LogOut } from "lucide-react";
import { useAuth } from "../contexts/auth";
import { User } from "../types/types";

type SidebarProps = {
    currentPath: string;
};

function Sidebar({ currentPath }: SidebarProps) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { user } = useAuth() as {
        user: User;
    };
    const { name, email } = user;
    const sidebar = [
        {
            icon: <House />,
            name: "Dashboard",
            link: "/dashboard",
            isActive: currentPath === "/dashboard",
        },
        {
            icon: <Box />,
            name: "Inventory",
            link: "/inventory",
            isActive: currentPath === "/inventory",
        },
        {
            icon: <Receipt />,
            name: "Sales",
            link: "/sales",
            isActive: currentPath === "/sales",
        },
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="flex flex-col justify-center items-center mt-4 gap-10">
            <div className="flex justify-center items-center">
                <img src={Logo} alt="Logo" width="100" height="109" />
                <h2 className="text-2xl text-blue-500 dark:text-blue-600 font-semibold">
                    INVENTORY
                </h2>
            </div>
            <ul className="mt-1">
                {sidebar.map((item) => (
                    <li
                        key={item.link}
                        className={`flex items-center gap-4 text-2xl rounded-md ${item.isActive ? "text-blue-500 dark:text-blue-600" : "text-gray-500"} px-10 py-4 hover:bg-gray-200 dark:hover:bg-gray-900 cursor-pointer`}
                        onClick={() => {
                            navigate({ to: item.link });
                        }}
                    >
                        {item.icon}
                        {item.name}
                    </li>
                ))}
            </ul>
            <div className="flex flex-col mt-auto mb-6 w-full text-center border-t border-gray-200 dark:border-gray-500">
                <div className="text-lg font-semibold text-gray-400">
                    {name}
                </div>

                <div className="mt-1 text-sm text-gray-500">{email}</div>

                <button
                    onClick={handleLogout}
                    className="mt-4 flex items-center gap-2 text-sm font-medium text-red-500 transition-colors hover:text-red-600 focus:outline-none self-center"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
