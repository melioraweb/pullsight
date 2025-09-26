import { ROUTE_CONSTANTS } from "@/lib/constants";
import Link from "next/link";

export default function ForbiddenPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="text-6xl font-bold mb-4">403</h1>
            <h2 className="text-2xl mb-2">Forbidden</h2>
            <p className="mb-4">
                You do not have permission to access this page.
            </p>
            <Link
                href={ROUTE_CONSTANTS.APP_DASHBOARD}
                className="text-blue-500 underline"
            >
                Go back to Dashboard
            </Link>
        </div>
    );
}
