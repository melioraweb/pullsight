import { AUTH_CONSTANTS, ROUTE_CONSTANTS } from "@/lib/constants";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const Home = async () => {
    const token = (await cookies()).get(AUTH_CONSTANTS.ACCESS_TOKEN)?.value;
    if (!token) {
        redirect(ROUTE_CONSTANTS.LOGIN);
    } else {
        redirect(ROUTE_CONSTANTS.APP_DASHBOARD);
    }
};

export default Home;
