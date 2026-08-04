import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import type { User, Product } from "./types/types.ts";
import "@tanstack/react-router";

interface RouterContext {
    user: User | null;
    products: Product[] | null;
}

export const router = createRouter({
    routeTree,
    context: {
        user: null,
        products: null,
    } satisfies RouterContext,
});

declare module "@tanstack/react-router" {
    interface Register {
        context: RouterContext;
    }
}
