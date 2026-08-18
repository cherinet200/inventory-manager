import { Search, Bell, Settings, Menu } from "lucide-react";
import { useState } from "react";
import { useProduct } from "../contexts/products";
import Logo from "../assets/inventory.png";

function Navbar() {
    const [query, setQuery] = useState("");
    const { fetchProduct, setSearchedPage } = useProduct();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target as typeof e.target & {
            value: string;
        };

        setQuery(value);
    };

    return (
        <div className="sticky top-0 flex items-center justify-between gap-4 bg-white dark:bg-gray-950 rounded p-6">
            <button className="hover:text-blue-600 dark:hover:text-blue-700 block lg:hidden">
                <Menu size={40} />
            </button>
            <div className="w-full relative">
                <Search className="absolute top-2.5 left-2 text-gray-500 dark:text-gray-600" />
                <input
                    type="search"
                    name="search"
                    id="search"
                    className="border w-1/2 outline-none text-lg dark:text-gray-400 border-gray-300 dark:border-gray-700 pl-10 p-2 pr-4 rounded-md"
                    placeholder="Search products"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            setSearchedPage(true);
                            fetchProduct({ query: `&search=${query}` });
                        }
                    }}
                />
            </div>
            <div className="flex gap-4 items-center dark:text-gray-400">
                <Bell />
                <Settings />
            </div>
        </div>
    );
}

export function IndexNavbar() {
    return (
        <div className="sticky top-0 flex items-center justify-between gap-4 bg-white dark:bg-gray-950 rounded p-6 select-none">
            <div className="flex items-center gap-2">
                <img src={Logo} alt="Brand" width={60} height={60} />
                <div className="font-playfair text-3xl font-bold dark:text-blue-600 tracking-tight">
                    INVENTORY MANAGER
                </div>
            </div>
            <div className="flex gap-4 items-center">
                <button
                    className="hover:text-blue-600"
                    onMouseDown={() => (window.location.href = "/signin")}
                >
                    Sign In
                </button>
                <button
                    className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
                    onMouseDown={() => (window.location.href = "/signup")}
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
}

export default Navbar;
