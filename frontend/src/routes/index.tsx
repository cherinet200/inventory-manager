import { createFileRoute } from "@tanstack/react-router";
import { IndexNavbar } from "../components/navbar";

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <IndexNavbar />
        </div>
    );
}
