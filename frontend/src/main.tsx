import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import { router } from "./router";
import { RouterProvider } from "@tanstack/react-router";
import { useAuth, AuthProvider } from "./contexts/auth";
import { useProduct, ProductProvider } from "./contexts/products";
import { SalesProvider } from "./contexts/sales";

function App() {
    const { user } = useAuth();
    const { products } = useProduct();
    return <RouterProvider router={router} context={{ user, products }} />;
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <ProductProvider>
                <SalesProvider>
                    <App />
                </SalesProvider>
            </ProductProvider>
        </AuthProvider>
    </StrictMode>,
);
