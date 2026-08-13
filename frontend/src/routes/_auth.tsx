import {
    Outlet,
    createFileRoute,
    redirect,
    useRouterState,
} from "@tanstack/react-router";
import type { User } from "../types/types.js";
import Sidebar from "../components/sidebar.js";
import Navbar from "../components/navbar.js";
import { CreateProduct } from "../components/productForms.js";

export const Route = createFileRoute("/_auth")({
    beforeLoad({ context }) {
        if (
            (context as { user: User | null }).user === null ||
            ((context as { token: string | null }).token === null &&
                (context as { refToken: string | null }).refToken === null)
        ) {
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
        <div className="grid lg:grid-cols-[1fr_5fr] gap-0.5 bg-gray-100 dark:bg-gray-900">
            <CreateProduct />
            <div className="hidden lg:flex bg-white dark:bg-gray-950 rounded-md shadow-sm">
                <Sidebar currentPath={pathname} />
            </div>
            <div className="h-screen">
                <Navbar />
                <Outlet />
            </div>
        </div>
    );
}
