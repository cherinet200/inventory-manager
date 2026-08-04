import { Search, Bell, Settings } from "lucide-react";
import { useState } from "react";
import Cookies from "js-cookie";
import { useProduct } from "../contexts/product";

function Navbar() {
    const [query, setQuery] = useState("");
    const { fetchProduct } = useProduct();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target as typeof e.target & {
            value: string;
        };

        setQuery(value);
    };

    return (
        <div className="sticky top-0 flex gap-100 bg-white dark:bg-gray-950 rounded p-6">
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
                        e.key === "Enter" &&
                            fetchProduct({ query: `&search=${query}` });
                    }}
                />
            </div>
            <div className="ml-auto flex gap-4 items-center dark:text-gray-400">
                <Bell />
                <Settings />
            </div>
        </div>
    );
}

export default Navbar;
