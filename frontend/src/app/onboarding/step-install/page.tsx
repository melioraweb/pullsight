"use client";

import { Button } from "@/components/ui/button";

const Step1Page = () => {
    const handleInstall = () => {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const baseUrl = `${apiUrl}/github/install`;
        // Redirect to the GitHub installation URL
        window.location.href = baseUrl;
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
                {/* Left column */}
                <div className="col-span-4 col-start-2 xl:pr-16">
                    <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                        Install PullSight to Select Repositories
                    </h2>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        To analyze your Pull Requests and provide smart
                        feedback, PullSight needs access to your repositories.
                        This is a secure, standard connection via OAuth.
                    </p>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        You can select all repositories or specific ones during
                        the installation process.
                    </p>
                    <Button
                        className="!bg-white !text-black hover:!bg-gray-200 cursor-pointer"
                        size={"xl"}
                        onClick={handleInstall}
                    >
                        Install PullSight
                    </Button>
                </div>

                {/* Right column */}
                <div className="col-span-6">
                    <div className="mb-4"></div>
                </div>
            </div>

            {/* Footer with action button */}
            {/* <ActionFooter
                buttonText="Select Repository"
                isEnabled={Boolean(selectedRepo) && !false}
                onClick={onStepComplete}
                // isLoading={isPending}
                // backButtonText="Back"
                onBackClick={() => redirect("ROUTE_CONSTANTS.ONBOARDING_STEP_2")}
            /> */}
        </>
    );
};

export default Step1Page;
