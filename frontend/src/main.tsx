import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import { router } from "./router";
import { ThemeProvider } from "./contexts/theme";
import { RouterProvider } from "@tanstack/react-router";
import { useAuth, AuthProvider } from "./contexts/auth";
import { useProduct, ProductProvider } from "./contexts/products";
import { SalesProvider } from "./contexts/sales";
import { Toaster } from "sonner";

function App() {
    const { user } = useAuth();
    const { products } = useProduct();
    return (
        <>
            <Toaster
                position="top-center"
                richColors
                toastOptions={{
                    classNames: {
                        success: "!bg-green-600/15 !text-green-600 !border-0",
                        error: "!bg-red-600/15 !text-red-600 !border-0",
                    },
                }}
            />
            <RouterProvider router={router} context={{ user, products }} />
        </>
    );
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <AuthProvider>
                <ProductProvider>
                    <SalesProvider>
                        <App />
                    </SalesProvider>
                </ProductProvider>
            </AuthProvider>
        </ThemeProvider>
    </StrictMode>,
);
