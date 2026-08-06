import {
    Outlet,
    createFileRoute,
    redirect,
    useRouterState,
} from "@tanstack/react-router";
import type { User } from "../types/types.js";
import Sidebar from "../components/sidebar.js";
import Navbar from "../components/navbar.js";
import CreateProduct from "../components/createProduct";

export const Route = createFileRoute("/_auth")({
    beforeLoad({ context }) {
        if ((context as { user: User | null }).user === null) {
            throw redirect({
                to: "/signin",
            });
        }
    },
    component: RouteComponent,
});

function RouteComponent() {
    const pathname = useRouterState({
        select: (state) => state.location.pathname,
    });
    return (
        <div className="flex bg-gray-100 dark:bg-gray-900">
            <CreateProduct />
            <div className="hidden lg:flex justify-center w-72 mr-0.5 bg-white dark:bg-gray-950 rounded-md shadow-sm">
                <Sidebar currentPath={pathname} />
            </div>
            <div className="flex-5 h-screen overflow-auto">
                <Navbar />
                <Outlet />
            </div>
        </div>
    );
}
