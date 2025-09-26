// app/dashboard/page.tsx
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { redirect } from "next/navigation";

const AuthIndex = () => {
    redirect(ROUTE_CONSTANTS.LOGIN);
};

export default AuthIndex;
