import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { DetailsPage } from "./pages/DetailsPage";

export const router = createBrowserRouter([
    {
        path: "/",
        children: [
            { index: true, Component: HomePage },
            { path: "details", Component: DetailsPage },
        ],
    },
]);
