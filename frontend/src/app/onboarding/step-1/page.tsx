"use client";

import { Organization } from "@/types/organization";
import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    useOrganizationAddMutation,
    useOrganizationQuery,
} from "@/api/queries/organization";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateUserMutation } from "@/api/queries/auth";
import ContentCard from "@/components/reusable/ContentCard";
import Avatar from "@/components/reusable/Avatar";
import { humanizeDate } from "@/lib/dayjs";
import showToast from "@/lib/toast";

const Step1Page = () => {
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const { user, workspaces } = useAuthStore((s) => s);

    const provider = user?.provider || "github"; // Default to GitHub if not set
    const onboardedWorkspaces = workspaces
        ?.filter(
            (workspace) =>
                !workspace.onboardingStep || workspace.onboardingStep == 0
        )
        ?.map((ws) => ws.id);

    const router = useRouter();

    const {
        data: organizations,
        isLoading,
        error,
    } = useOrganizationQuery({ provider });

    const {
        mutateAsync: updateUser,
        isPending: isUpdatingUser,
        error: updateUserError,
    } = useUpdateUserMutation();

    const {
        mutateAsync: addOrganization,
        isPending: isAddingOrg,
        error: addOrgError,
    } = useOrganizationAddMutation({
        ...(provider === "github" ? {} : { provider }),
    });

    const onStepComplete = async () => {
        if (!selectedOrg) return;
        if (selectedOrg.provider == "github" && !selectedOrg?.installationId) {
            showToast.error(
                "Please install the app on your organization to proceed."
            );
            return;
        }

        if (
            user?.currentWorkspace &&
            typeof user.currentWorkspace !== "string" &&
            user.currentWorkspace.id === selectedOrg.id
        ) {
            // If the selected organization is already the current workspace, just redirect
            router.push(ROUTE_CONSTANTS.ONBOARDING_STEP_2);
            return;
        }

        if (provider === "github") {
            updateUser({
                currentWorkspace: selectedOrg._id,
            })
                .then(() => {
                    // Redirect to the next step after updating user
                    router.push(ROUTE_CONSTANTS.ONBOARDING_STEP_2);
                })
                .catch((error) => {
                    console.error("Error updating user:", error);
                });
        } else if (provider === "bitbucket") {
            addOrganization({
                slug: selectedOrg?.slug || "",
                type: selectedOrg?.type || "",
            })
                .then(() => {
                    // Redirect to the next step after adding organization
                    router.push(ROUTE_CONSTANTS.ONBOARDING_STEP_2);
                })
                .catch((error) => {
                    console.error("Error adding organization:", error);
                });
        }
    };

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
                <div className="col-span-12 xl:col-span-4 xl:col-start-2 xl:pr-16">
                    <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                        Connect Your Organization
                    </h2>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        To analyze your Pull Requests and provide smart
                        feedback, PullSight needs access to your
                        organization&apos;s repositories. This is a secure,
                        standard connection via OAuth.
                    </p>
                </div>

                {/* Right column */}
                <div className="col-span-12 xl:col-span-6">
                    <ContentCard>
                        <ContentCard.Header className="flex-col md:flex-row gap-y-4">
                            <h3 className="text-[var(--title-50)] font-medium text-lg">
                                Organizations list
                            </h3>
                            {provider === "github" && (
                                <Button
                                    variant="outline"
                                    className=""
                                    onClick={handleInstall}
                                >
                                    <Plus className="inline mr-1" />
                                    <span>Add New Organization</span>
                                </Button>
                            )}
                        </ContentCard.Header>
                        <ContentCard.Body
                            hasError={!!error}
                            isLoading={isLoading}
                            errorLabel={
                                error
                                    ? "Error loading organizations. Please try again."
                                    : undefined
                            }
                            noContentLabel={
                                organizations && organizations?.length === 0
                                    ? "No organizations found. Please add an organization to continue."
                                    : undefined
                            }
                        >
                            <SelectableList
                                items={organizations || []}
                                selectedId={selectedOrg?.id}
                                onSelect={(id) =>
                                    setSelectedOrg(
                                        organizations?.find(
                                            (org) => org.id === id
                                        ) || null
                                    )
                                }
                                getKey={(item) => String(item.id)}
                                renderItem={(item) => (
                                    <div className="grid grid-cols-4 items-center gap-4 flex-grow-1 text-sm">
                                        <h4 className="col-span-2">
                                            {item.name}
                                        </h4>
                                        <Avatar
                                            className="col-span-2 hidden md:flex"
                                            src={item.avatarUrl || ""}
                                            name={item.name}
                                        />
                                        {/* <div className="col-span-1 text-right text-[var(--subtitle-500)] text-sm whitespace-nowrap hidden md:block">
                                            {humanizeDate(item.createdOn || "")}
                                        </div> */}
                                    </div>
                                )}
                                renderHeader={() => (
                                    <div className="ml-9 md:grid grid-cols-4 gap-4 py-2 px-4 text-[var(--subtitle-400)] text-xs hidden">
                                        <div className="col-span-2">Title</div>
                                        <div className="col-span-2">Author</div>
                                        {/* <div className="col-span-1 text-right">
                                            Created at
                                        </div> */}
                                    </div>
                                )}
                                isDisabled={(item) =>
                                    onboardedWorkspaces
                                        ? onboardedWorkspaces.includes(item.id)
                                        : false
                                }
                            />
                        </ContentCard.Body>
                    </ContentCard>
                </div>
            </div>

            {/* Footer with action button */}
            <ActionFooter
                buttonText="Connect Organization"
                isEnabled={
                    Boolean(selectedOrg) &&
                    !isLoading &&
                    !isUpdatingUser &&
                    !isAddingOrg
                }
                isLoading={isLoading || isUpdatingUser || isAddingOrg}
                onClick={onStepComplete}
            />
        </>
    );
};

export default Step1Page;
