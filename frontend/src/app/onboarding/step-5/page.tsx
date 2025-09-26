"use client";

import { Organization } from "@/types/organization";
import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { use, useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { StarBullet } from "@/components/reusable/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import RepositoryList from "./RepositoryList";
import MemberList from "./MemberList";
import { useOrganizationMembersQuery } from "@/api/queries/member";
import { useAuthStore } from "@/store/authStore";
import { useMakeSubscriptionMutation } from "@/api/queries/workspace";
import { TeamMember } from "@/types/user";
import { Repository } from "@/types/repository";
import { useUpdateUserMutation } from "@/api/queries/auth";

const Step5Page = () => {
    const user = useAuthStore((state) => state.user);
    const [selectedMembers, setSelectedMembers] = useState<TeamMember[]>([]);
    const [selectedRepositories, setSelectedRepositories] = useState<
        Repository[]
    >([]);

    const searchParams = useSearchParams();

    const repoId = searchParams.get("repoId") as string;
    const prId = searchParams.get("prId") as string;

    const {
        mutateAsync: createSubscription,
        isPending: isCreatingSubscription,
    } = useMakeSubscriptionMutation();
    const { mutateAsync: updateUser, isPending: isUpdatingUser } =
        useUpdateUserMutation();

    const onStepComplete = () => {
        if (!selectedMembers.length || !selectedRepositories.length) {
            return;
        }
        const repositories = selectedRepositories.map((repo) => {
            return {
                ...repo,
                id: repo.id.toString(),
            };
        });

        createSubscription({
            members: selectedMembers,
            repositories,
        })
            .then(() => {
                updateUser({
                    currentWorkspace:
                        typeof user?.currentWorkspace === "object" &&
                        user?.currentWorkspace !== null
                            ? user.currentWorkspace._id
                            : typeof user?.currentWorkspace === "string"
                            ? user.currentWorkspace
                            : "",
                }).then(() => {
                    // Redirect to dashboard with congratulations flag
                    const dashboardUrl = new URL(
                        ROUTE_CONSTANTS.APP_DASHBOARD,
                        window.location.origin
                    );
                    dashboardUrl.searchParams.set("showCongrats", "true");
                    redirect(dashboardUrl.toString());
                });
            })
            .catch((error) => {
                console.error("Error creating subscription:", error);
            });
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
                {/* Left column */}
                <div className="col-span-12 flex items-center flex-col lg:flex-row lg:gap-x-10 gap-y-10 divide-y lg:divide-y-0 lg:divide-x mb-4">
                    <div className="max-w-[690px] lg:pr-16">
                        <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                            Set Up Your Repositories & Team
                        </h2>
                        <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                            You can view pull requests based on your selected
                            team members and repositories. Adjust your
                            selections to see the most relevant PRs for your
                            workflow.
                        </p>
                    </div>
                    <div className="">
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                <div className="shrink-0">
                                    <StarBullet />
                                </div>
                                <span>
                                    Create unlimited code reviews on your PRs
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                <div className="shrink-0">
                                    <StarBullet />
                                </div>
                                <span>
                                    You can add or remove repositories and team
                                    members at any time
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-[var(--title-50)]">
                                <div className="shrink-0">
                                    <StarBullet />
                                </div>
                                <span>Explore all dashboards and insights</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* left column */}
                <div className="col-span-12 xl:col-span-6">
                    <MemberList
                        onSelectionChange={(selectedMembers) =>
                            setSelectedMembers(selectedMembers)
                        }
                    />
                </div>
                {/* Right column */}
                <div className="col-span-12 xl:col-span-6">
                    <RepositoryList
                        onSelectionChange={(selectedRepos) =>
                            setSelectedRepositories(selectedRepos)
                        }
                    />
                </div>
            </div>

            {/* Footer with action button */}
            <ActionFooter
                confirmButtonClassname="!bg-primary hover:!bg-gray-200"
                buttonText="Get Started"
                isEnabled={
                    selectedMembers.length > 0 &&
                    selectedRepositories.length > 0
                }
                isLoading={isCreatingSubscription || isUpdatingUser}
                onClick={onStepComplete}
                onBackClick={() =>
                    redirect(
                        ROUTE_CONSTANTS.ONBOARDING_STEP_4 +
                            "?repoId=" +
                            repoId +
                            "&prId=" +
                            prId
                    )
                }
                // confirmButtonSubtitle="Invitations will be sent automatically."
            />
        </>
    );
};

export default Step5Page;
