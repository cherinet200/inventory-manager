import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter(),
        react(),
        tailwindcss(),
        babel({ presets: [reactCompilerPreset()] }),
    ],
    server: {
        proxy: {
            "/api": {
                target: "https://inventory-manager-mu-silk.vercel.app",
                changeOrigin: true,
            },
            "/auth": {
                target: "https://inventory-manager-mu-silk.vercel.app",
                changeOrigin: true,
            },
        },
    },
});
