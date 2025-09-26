// app/dashboard/page.tsx
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { redirect } from "next/navigation";

const OnboardingIndex = () => {
    redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_1);
};

export default OnboardingIndex;
