import { createContext, useContext } from "react";

interface DashboardContext {
    getDetails: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContext | null>(null);

const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
    const getDetails = async () => {
        const a = await fetch("/s");
    };

    <DashboardContext.Provider value={{ getDetails }}>
        {children}
    </DashboardContext.Provider>;
};

const useDashboard = () => {
    const context = useContext(DashboardContext);

    if (!context) {
        throw new Error("useDashboard must be used within DashboardProvider");
    }

    return context;
};
