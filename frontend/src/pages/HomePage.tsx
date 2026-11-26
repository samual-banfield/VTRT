import { Link } from "react-router";

export function HomePage() {
    return (
        <>
            <h1>Home</h1>
            <Link to="/details">Go to details</Link>
        </>
    );
}
