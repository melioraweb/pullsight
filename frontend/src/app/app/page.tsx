import { ROUTE_CONSTANTS } from "@/lib/constants";
import { redirect } from "next/navigation";

const AppIndex = () => {
    redirect(ROUTE_CONSTANTS.APP_DASHBOARD);
};

export default AppIndex;
